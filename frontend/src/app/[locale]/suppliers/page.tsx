import { SuppliersDirectory } from "@/modules/suppliers";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.suppliers");

export default function Page() {
  return <SuppliersDirectory />;
}
