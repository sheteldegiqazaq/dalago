import { RegisterPage } from "@/modules/session";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.register");

export default function Page() {
  return <RegisterPage />;
}
