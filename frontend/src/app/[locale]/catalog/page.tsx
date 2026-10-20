import { CatalogPage } from "@/modules/catalog";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.catalog");

export default function Page() {
  return <CatalogPage />;
}
