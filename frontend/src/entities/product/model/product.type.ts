export type ProductCardData = {
  id: string;
  title: string;
  titleKk: string | null;
  price: number;
  unit: string;
  availableQty: number;
  minOrderQty: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  imageUrl: string | null;
  isDemo: boolean;
  city: { nameRu: string; nameKk: string };
  category: { icon: string; nameRu: string; nameKk: string };
  supplier: { id: string; name: string };
};
