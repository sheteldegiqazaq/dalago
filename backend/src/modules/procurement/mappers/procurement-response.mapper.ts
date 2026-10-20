import { toNumber } from '@shared/utils/money';
import type {
  OfferDto,
  RequestDetailsDto,
  RequestListItemDto,
  SupplierOfferDto,
} from '../dto/procurement-response.dto';
import type {
  OfferRecord,
  RequestListRecord,
  SupplierOfferRecord,
} from '../repositories/procurement.select';

const day = (date: Date) => date.toISOString().slice(0, 10);

export class ProcurementResponseMapper {
  static toListItem(
    request: RequestListRecord,
    showBuyerPhone: boolean,
  ): RequestListItemDto {
    return {
      id: request.id,
      title: request.title,
      description: request.description,
      quantity: toNumber(request.quantity),
      unit: request.unit,
      targetPrice: toNumber(request.targetPrice),
      currency: request.currency,
      desiredDate: day(request.desiredDate),
      deliveryAddress: request.deliveryAddress,
      status: request.status,
      isDemo: request.isDemo,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      offerCount: request._count.offers,
      deliveryCity: request.deliveryCity,
      category: request.category,
      buyer: {
        id: request.buyer.id,
        name: request.buyer.name,
        type: request.buyer.type,
        phone: showBuyerPhone ? request.buyer.phone : null,
      },
    };
  }

  static toOffer(offer: OfferRecord): OfferDto {
    const quantity = toNumber(offer.quantity);
    const price = toNumber(offer.pricePerUnit);
    const delivery = toNumber(offer.deliveryCost);

    return {
      id: offer.id,
      requestId: offer.requestId,
      quantity,
      pricePerUnit: price,
      currency: offer.currency,
      deliveryCost: delivery,
      totalCost: Math.round((quantity * price + (delivery ?? 0)) * 100) / 100,
      estimatedDeliveryDate: day(offer.estimatedDeliveryDate),
      terms: offer.terms,
      status: offer.status,
      isDemo: offer.isDemo,
      createdAt: offer.createdAt.toISOString(),
      supplier: offer.supplier,
      product: offer.product,
    };
  }

  static toDetails(view: {
    request: RequestListRecord;
    offers: OfferRecord[];
    isOwner: boolean;
    showBuyerPhone: boolean;
    myOfferId: string | null;
    canOffer: boolean;
  }): RequestDetailsDto {
    return {
      ...ProcurementResponseMapper.toListItem(
        view.request,
        view.showBuyerPhone,
      ),
      offers: view.offers.map((o) => ProcurementResponseMapper.toOffer(o)),
      viewer: {
        isOwner: view.isOwner,
        myOfferId: view.myOfferId,
        canOffer: view.canOffer,
      },
    };
  }

  static toSupplierOffer(offer: SupplierOfferRecord): SupplierOfferDto {
    return {
      ...ProcurementResponseMapper.toOffer(offer),
      request: {
        id: offer.request.id,
        title: offer.request.title,
        status: offer.request.status,
        unit: offer.request.unit,
        quantity: toNumber(offer.request.quantity),
        desiredDate: day(offer.request.desiredDate),
        deliveryCity: offer.request.deliveryCity,
        buyer: offer.request.buyer,
      },
    };
  }
}
