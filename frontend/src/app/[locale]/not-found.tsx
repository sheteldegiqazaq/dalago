import { useTranslations } from "next-intl";

import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="container-page py-16">
      <EmptyState
        title={t("notFound")}
        text={t("notFoundText")}
        action={
          <Button asChild>
            <Link href="/">{t("toHome")}</Link>
          </Button>
        }
      />
    </div>
  );
}
