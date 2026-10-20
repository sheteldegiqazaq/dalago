import { LandingPage } from "@/modules/landing";

import { pageMetadata } from "./_lib/page-metadata";

export const generateMetadata = pageMetadata("meta.title");

export default function Page() {
  return <LandingPage />;
}
