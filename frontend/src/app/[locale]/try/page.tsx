import { TryPage } from "@/modules/session";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.try");

export default function Page() {
  return <TryPage />;
}
