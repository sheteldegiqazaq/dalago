import type { ProductStatus } from '@generated/prisma/client';
import type { Paginated } from '@shared/pagination/pagination';
import type {
  ProductSearchCriteria,
  ProductWriteData,
} from '../types/product.type';
import type { ProductDetailsRecord, ProductListRecord } from './product.select';

export interface ProductRepository {
  search(
    criteria: ProductSearchCriteria,
  ): Promise<Paginated<ProductListRecord>>;
  findById(id: string): Promise<ProductDetailsRecord | null>;
  listBySupplier(companyId: string): Promise<ProductListRecord[]>;
  categoryExists(categoryId: string): Promise<boolean>;
  cityExists(cityId: string): Promise<boolean>;
  create(
    supplierCompanyId: string,
    data: ProductWriteData,
  ): Promise<ProductDetailsRecord>;
  update(id: string, data: ProductWriteData): Promise<ProductDetailsRecord>;
  setStatus(id: string, status: ProductStatus): Promise<ProductDetailsRecord>;
  delete(id: string): Promise<void>;
}
