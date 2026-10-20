import { toNumber } from '@shared/utils/money';
import type {
  ProductDetailsDto,
  ProductListItemDto,
} from '../dto/product-response.dto';
import type {
  ProductDetailsRecord,
  ProductListRecord,
} from '../repositories/product.select';

export class ProductResponseMapper {
  static toListItem(product: ProductListRecord): ProductListItemDto {
    return {
      id: product.id,
      title: product.title,
      titleKk: product.titleKk,
      price: toNumber(product.price),
      currency: product.currency,
      unit: product.unit,
      availableQty: toNumber(product.availableQty),
      minOrderQty: toNumber(product.minOrderQty),
      deliveryAvailable: product.deliveryAvailable,
      pickupAvailable: product.pickupAvailable,
      imageUrl: product.imageUrl,
      status: product.status,
      isSample: product.isSample,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      city: product.city,
      category: product.category,
      supplier: {
        id: product.supplier.id,
        name: product.supplier.name,
        type: product.supplier.type,
      },
    };
  }

  static toDetails(
    product: ProductDetailsRecord,
    isOwner: boolean,
  ): ProductDetailsDto {
    return {
      ...ProductResponseMapper.toListItem(product),
      description: product.description,
      descriptionKk: product.descriptionKk,
      tags: product.tags,
      isOwner,
      supplier: {
        ...product.supplier,
        createdAt: product.supplier.createdAt.toISOString(),
      },
    };
  }
}
