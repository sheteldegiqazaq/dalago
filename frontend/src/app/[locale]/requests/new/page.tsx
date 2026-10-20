import { RequestFormPage } from "@/modules/requests";

import { pageMetadata } from "../../_lib/page-metadata";

export const generateMetadata = pageMetadata("requests.newTitle");

export default function Page() {
  return <RequestFormPage />;
}
