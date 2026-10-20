import { InquiriesPage } from "@/modules/inquiries";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.messages");

export default function Page() {
  return <InquiriesPage />;
}
