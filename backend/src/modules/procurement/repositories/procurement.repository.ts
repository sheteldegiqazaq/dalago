import type { Paginated } from '@shared/pagination/pagination';
import type {
  OfferWriteData,
  OpenRequestCriteria,
  RequestStatusFilter,
  RequestWriteData,
} from '../types/procurement.type';
import type {
  OfferRecord,
  RequestDetailsRecord,
  RequestListRecord,
  SupplierOfferRecord,
} from './procurement.select';

export interface ProcurementRepository {
  listActive(
    criteria: OpenRequestCriteria,
  ): Promise<Paginated<RequestListRecord>>;
  listByBuyer(
    companyId: string,
    status?: RequestStatusFilter,
  ): Promise<RequestListRecord[]>;
  findRequest(id: string): Promise<RequestDetailsRecord | null>;
  createRequest(
    buyerCompanyId: string,
    data: RequestWriteData,
  ): Promise<RequestDetailsRecord>;
  updateRequest(
    id: string,
    data: RequestWriteData,
  ): Promise<RequestDetailsRecord>;
  /** Закрывает заявку и отклоняет все ожидающие предложения (одна транзакция). */
  closeRequest(id: string): Promise<RequestDetailsRecord>;

  findOffer(id: string): Promise<OfferRecord | null>;
  hasOffer(requestId: string, supplierCompanyId: string): Promise<boolean>;
  productBelongsTo(productId: string, companyId: string): Promise<boolean>;
  categoryExists(categoryId: string): Promise<boolean>;
  cityExists(cityId: string): Promise<boolean>;
  /** Создаёт предложение и переводит заявку в OFFERS_RECEIVED (одна транзакция). */
  createOffer(
    requestId: string,
    supplierCompanyId: string,
    data: OfferWriteData,
  ): Promise<OfferRecord>;
  updateOffer(id: string, data: OfferWriteData): Promise<OfferRecord>;
  /**
   * Принимает предложение, отклоняет остальные ожидающие и переводит заявку в ACCEPTED.
   * Возвращает false, если состояние успело измениться (гонка двух кликов).
   */
  acceptOffer(offerId: string, requestId: string): Promise<boolean>;
  rejectOffer(offerId: string): Promise<boolean>;
  listOffersBySupplier(companyId: string): Promise<SupplierOfferRecord[]>;
}
