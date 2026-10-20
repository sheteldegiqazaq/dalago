import { RequestDetailsPage } from "@/modules/requests";

import { pageMetadata } from "../../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.requests");

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RequestDetailsPage id={id} />;
}
