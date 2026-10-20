import { OpenDataPage } from "@/modules/open-data";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.openData");

export default function Page() {
  return <OpenDataPage />;
}
