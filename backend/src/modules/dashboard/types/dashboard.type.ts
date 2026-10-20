export type ActivityType =
  | 'REQUEST_CREATED'
  | 'OFFER_RECEIVED'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'PRODUCT_UPDATED'
  | 'MESSAGE_RECEIVED';

export type ActivityItem = {
  type: ActivityType;
  at: Date;
  title: string;
  counterpart: string | null;
  requestId: string | null;
  productId: string | null;
  inquiryId: string | null;
};

export type SupplierSummary = {
  activeProducts: number;
  inactiveProducts: number;
  pendingOffers: number;
  acceptedOffers: number;
  inquiries: number;
  matchingRequests: Array<{
    id: string;
    title: string;
    quantity: number;
    unit: string;
    desiredDate: Date;
    cityId: string;
    buyerName: string;
  }>;
};

export type BuyerSummary = {
  activeRequests: number;
  awaitingFirstOffer: number;
  pendingOffers: number;
  acceptedRequests: number;
  inquiries: number;
};

export type MarketplaceStats = {
  suppliers: number;
  buyers: number;
  activeProducts: number;
  activeRequests: number;
  acceptedRequests: number;
  citiesWithSuppliers: number;
  sampleRecordsOnly: boolean;
};
