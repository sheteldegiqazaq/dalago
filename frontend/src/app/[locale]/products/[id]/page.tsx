import { ProductDetailsPage } from "@/modules/product-details";

import { pageMetadata } from "../../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.catalog");

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductDetailsPage id={id} />;
}
