import { RegionalMapPage } from "@/modules/regional-map";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.map");

export default function Page() {
  return <RegionalMapPage />;
}
