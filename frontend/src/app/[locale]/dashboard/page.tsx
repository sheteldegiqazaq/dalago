import { DashboardPage } from "@/modules/dashboard";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.dashboard");

export default function Page() {
  return <DashboardPage />;
}
