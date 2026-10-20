import { LoginPage } from "@/modules/session";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.login");

export default function Page() {
  return <LoginPage />;
}
