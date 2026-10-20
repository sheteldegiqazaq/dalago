import { NotFoundApplicationException } from '@shared/exceptions/not-found.exception';
import type { ProcurementRepository } from '../repositories/procurement.repository';
import {
  type RequestViewer,
  visibleRequestFor,
} from '../services/request-visibility';

export class GetRequestUseCase {
  constructor(private readonly procurement: ProcurementRepository) {}

  async execute(id: string, viewer: RequestViewer) {
    const request = await this.procurement.findRequest(id);
    const view = request ? visibleRequestFor(request, viewer) : null;

    if (!view) {
      throw new NotFoundApplicationException(
        'Заявка не найдена',
        'REQUEST_NOT_FOUND',
      );
    }

    return view;
  }
}
