import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from '@shared/decorators/auth.decorator';
import { Authorized } from '@shared/decorators/authorized.decorator';
import { OptionalAuthorization } from '@shared/decorators/optional-auth.decorator';
import { ProductInputDto, ProductStatusDto } from '../dto/product-input.dto';
import { ProductQueryDto } from '../dto/product-query.dto';
import {
  ProductDetailsDto,
  ProductListItemDto,
  ProductPageDto,
} from '../dto/product-response.dto';
import { ProductResponseMapper } from '../mappers/product-response.mapper';
import { ChangeProductStatusUseCase } from '../use-cases/change-product-status.use-case';
import { CreateProductUseCase } from '../use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../use-cases/delete-product.use-case';
import { GetProductUseCase } from '../use-cases/get-product.use-case';
import { ListMyProductsUseCase } from '../use-cases/list-my-products.use-case';
import { SearchProductsUseCase } from '../use-cases/search-products.use-case';
import { UpdateProductUseCase } from '../use-cases/update-product.use-case';

@ApiTags('Товары')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly searchProducts: SearchProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly listMyProducts: ListMyProductsUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly changeStatus: ChangeProductStatusUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Каталог: поиск, фильтры, сортировка' })
  @ApiOkResponse({ type: ProductPageDto })
  async search(@Query() query: ProductQueryDto): Promise<ProductPageDto> {
    const page = await this.searchProducts.execute({
      q: query.q,
      categorySlug: query.category,
      cityId: query.city,
      regionId: query.region,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      quantity: query.quantity
        ? { value: query.quantity, unit: query.unit }
        : undefined,
      deliveryOnly: query.delivery,
      supplierCompanyId: query.supplierId,
      sort: query.sort ?? 'relevance',
      page: query.page ?? 1,
      limit: query.limit ?? 12,
    });

    return {
      ...page,
      items: page.items.map((p) => ProductResponseMapper.toListItem(p)),
    };
  }

  @Get('mine')
  @Authorization('SUPPLIER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Мои объявления (включая неактивные)' })
  @ApiOkResponse({ type: [ProductListItemDto] })
  async mine(
    @Authorized('companyId') companyId: string | undefined,
  ): Promise<ProductListItemDto[]> {
    const products = await this.listMyProducts.execute(companyId);

    return products.map((p) => ProductResponseMapper.toListItem(p));
  }

  @Get(':id')
  @OptionalAuthorization()
  @ApiOperation({ summary: 'Карточка товара' })
  @ApiOkResponse({ type: ProductDetailsDto })
  async getById(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
  ): Promise<ProductDetailsDto> {
    const { product, isOwner } = await this.getProduct.execute(id, companyId);

    return ProductResponseMapper.toDetails(product, isOwner);
  }

  @Post()
  @Authorization('SUPPLIER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Опубликовать объявление' })
  @ApiOkResponse({ type: ProductDetailsDto })
  @HttpCode(200)
  async create(
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: ProductInputDto,
  ): Promise<ProductDetailsDto> {
    const product = await this.createProduct.execute(companyId, dto);

    return ProductResponseMapper.toDetails(product, true);
  }

  @Patch(':id')
  @Authorization('SUPPLIER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Изменить своё объявление' })
  @ApiOkResponse({ type: ProductDetailsDto })
  async update(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: ProductInputDto,
  ): Promise<ProductDetailsDto> {
    const product = await this.updateProduct.execute(id, companyId, dto);

    return ProductResponseMapper.toDetails(product, true);
  }

  @Patch(':id/status')
  @Authorization('SUPPLIER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Опубликовать или снять с публикации' })
  @ApiOkResponse({ type: ProductDetailsDto })
  async setStatus(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
    @Body() dto: ProductStatusDto,
  ): Promise<ProductDetailsDto> {
    const product = await this.changeStatus.execute(id, companyId, dto.status);

    return ProductResponseMapper.toDetails(product, true);
  }

  @Delete(':id')
  @Authorization('SUPPLIER')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Удалить своё объявление' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async remove(
    @Param('id') id: string,
    @Authorized('companyId') companyId: string | undefined,
  ): Promise<void> {
    await this.deleteProduct.execute(id, companyId);
  }
}
