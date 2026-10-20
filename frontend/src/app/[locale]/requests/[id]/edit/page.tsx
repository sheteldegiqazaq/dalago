import { RequestFormPage } from "@/modules/requests";

import { pageMetadata } from "../../../_lib/page-metadata";

export const generateMetadata = pageMetadata("requests.editTitle");

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RequestFormPage id={id} />;
}
