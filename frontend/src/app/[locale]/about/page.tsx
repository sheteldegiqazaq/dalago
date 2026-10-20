import { AboutPage } from "@/modules/about";

import { pageMetadata } from "../_lib/page-metadata";

export const generateMetadata = pageMetadata("nav.about");

export default function Page() {
  return <AboutPage />;
}
