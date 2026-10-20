import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Authorization } from '@shared/decorators/auth.decorator';
import { OptionalAuthorization } from '@shared/decorators/optional-auth.decorator';
import {
  AiSearchRequestDto,
  AiSearchResponseDto,
  AiStatusDto,
  ListingDraftRequestDto,
  ListingDraftResponseDto,
} from '../dto/ai.dto';
import { AiRateLimitGuard } from '../guards/ai-rate-limit.guard';
import { AiRunner } from '../services/ai-runner';
import { AiSearchUseCase } from '../use-cases/ai-search.use-case';
import { DraftListingUseCase } from '../use-cases/draft-listing.use-case';

@ApiTags('ИИ-помощник')
@Controller('ai')
export class AiController {
  constructor(
    private readonly draftListing: DraftListingUseCase,
    private readonly aiSearch: AiSearchUseCase,
    private readonly runner: AiRunner,
    private readonly config: ConfigService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Какой режим ИИ активен: Claude или резервные правила',
  })
  @ApiOkResponse({ type: AiStatusDto })
  status(): AiStatusDto {
    const mode = this.runner.configuredMode;

    return {
      mode,
      model:
        mode === 'claude' ? this.config.getOrThrow<string>('ai.model') : null,
    };
  }

  @Post('listing-draft')
  @Authorization('SUPPLIER')
  @UseGuards(AiRateLimitGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Черновик объявления из свободного текста (без публикации)',
  })
  @ApiOkResponse({ type: ListingDraftResponseDto })
  @ApiTooManyRequestsResponse()
  @HttpCode(200)
  listing(
    @Body() dto: ListingDraftRequestDto,
  ): Promise<ListingDraftResponseDto> {
    return this.draftListing.execute(dto.text);
  }

  @Post('search')
  @OptionalAuthorization()
  @UseGuards(AiRateLimitGuard)
  @ApiOperation({ summary: 'Поиск обычным языком по реальному каталогу' })
  @ApiOkResponse({ type: AiSearchResponseDto })
  @ApiTooManyRequestsResponse()
  @HttpCode(200)
  search(@Body() dto: AiSearchRequestDto): Promise<AiSearchResponseDto> {
    return this.aiSearch.execute(dto.query);
  }
}
