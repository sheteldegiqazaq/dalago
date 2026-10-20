import { SupplierProfilePage } from "@/modules/suppliers";

import { pageMetadata } from "../../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.suppliers");

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SupplierProfilePage id={id} />;
}
