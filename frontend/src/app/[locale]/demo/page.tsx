import { DemoPage } from "@/modules/session";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.demo");

export default function Page() {
  return <DemoPage />;
}
