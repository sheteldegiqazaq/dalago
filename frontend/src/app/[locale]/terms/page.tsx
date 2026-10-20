import { LegalPage } from "@/modules/about";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("footer.terms");

export default function Page() {
  return <LegalPage kind="terms" />;
}
