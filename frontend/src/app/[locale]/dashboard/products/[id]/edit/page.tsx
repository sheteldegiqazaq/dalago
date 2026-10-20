import { ListingEditorPage } from "@/modules/listing-editor";

import { pageMetadata } from "../../../../_lib/page-metadata";

export const generateMetadata = pageMetadata("listing.editTitle");

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ListingEditorPage id={id} />;
}
