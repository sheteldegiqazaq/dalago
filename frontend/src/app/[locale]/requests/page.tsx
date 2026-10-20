import { RequestsBoard } from "@/modules/requests";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.requests");

export default function Page() {
  return <RequestsBoard />;
}
