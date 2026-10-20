import type { SupplierDto } from '../dto/company.dto';
import type { SupplierRecord } from '../repositories/company.select';

export class SupplierMapper {
  static toHttp(company: SupplierRecord): SupplierDto {
    const categories = new Map(
      company.products.map(({ category }) => [category.id, category]),
    );

    return {
      id: company.id,
      name: company.name,
      type: company.type,
      description: company.description,
      address: company.address,
      phone: company.phone,
      isSample: company.isSample,
      createdAt: company.createdAt.toISOString(),
      city: company.city,
      productCount: company.products.length,
      categories: [...categories.values()],
    };
  }
}
