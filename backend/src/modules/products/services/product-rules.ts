import { DomainException } from '@shared/exceptions/domain.exception';
import type { ProductRepository } from '../repositories/product.repository';
import type { ProductWriteData } from '../types/product.type';

export async function assertValidProduct(
  products: ProductRepository,
  data: ProductWriteData,
): Promise<void> {
  if (data.availableQty > 0 && data.minOrderQty > data.availableQty) {
    throw new DomainException(
      'Минимальный заказ не может быть больше доступного объёма',
      'MIN_ORDER_EXCEEDS_STOCK',
    );
  }

  if (!data.deliveryAvailable && !data.pickupAvailable) {
    throw new DomainException(
      'Укажите хотя бы один способ получения: доставка или самовывоз',
      'NO_FULFILLMENT_OPTION',
    );
  }

  if (!(await products.categoryExists(data.categoryId))) {
    throw new DomainException('Неизвестная категория', 'UNKNOWN_CATEGORY');
  }

  if (!(await products.cityExists(data.cityId))) {
    throw new DomainException('Неизвестный город', 'UNKNOWN_CITY');
  }
}
