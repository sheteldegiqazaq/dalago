import { InquiryThreadPage } from "@/modules/inquiries";

import { pageMetadata } from "../../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.messages");

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InquiryThreadPage id={id} />;
}
