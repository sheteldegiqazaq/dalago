import { ListingEditorPage } from "@/modules/listing-editor";

import { pageMetadata } from "../../../_lib/page-metadata";

export const generateMetadata = pageMetadata("listing.newTitle");

export default function Page() {
  return <ListingEditorPage />;
}
