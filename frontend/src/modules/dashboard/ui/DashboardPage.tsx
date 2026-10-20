"use client";

import {
  CheckCircle2,
  ClipboardList,
  Clock,
  EyeOff,
  Inbox,
  LayoutGrid,
  MessageSquare,
  Package,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

import { localizedName } from "@/entities/catalog";
import { useReference } from "@/modules/reference";
import { MyOffersList, MyRequestsList } from "@/modules/requests";
import { RequireAuth, useSession } from "@/modules/session";
import { LoadingBlock } from "@/shared/components/loading-block";
import { StatTile } from "@/shared/components/stat-tile";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Link } from "@/shared/configs/i18/navigation";
import { formatDate, formatNumber } from "@/shared/lib/format";

import { useDashboard } from "../model/queries/use-dashboard";
import { ActivityFeed } from "./ActivityFeed";
import { CompanyProfileForm } from "./CompanyProfileForm";
import { MyProductsTable } from "./MyProductsTable";

function Overview() {
  const t = useTranslations();
  const locale = useLocale();
  const { role } = useSession();
  const reference = useReference();
  const dashboard = useDashboard();

  if (dashboard.isPending) {
    return <LoadingBlock label={t("common.loading")} />;
  }

  const data = dashboard.data;

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <section
        aria-label={t("dashboard.quickActions")}
        className="flex flex-wrap gap-3"
      >
        {role === "BUYER" ? (
          <>
            <Button asChild size="lg">
              <Link href="/requests/new">
                <Plus aria-hidden />
                {t("dashboard.newRequest")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/catalog">
                <LayoutGrid aria-hidden />
                {t("dashboard.browseCatalog")}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/dashboard/products/new">
                <Sparkles aria-hidden />
                {t("dashboard.newProductAi")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/requests">
                <ClipboardList aria-hidden />
                {t("dashboard.browseRequests")}
              </Link>
            </Button>
          </>
        )}
      </section>

      {data.buyer ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile
            icon={<ClipboardList />}
            label={t("dashboard.stats.activeRequests")}
            value={data.buyer.activeRequests}
          />
          <StatTile
            icon={<Clock />}
            label={t("dashboard.stats.awaitingFirstOffer")}
            value={data.buyer.awaitingFirstOffer}
          />
          <StatTile
            icon={<Inbox />}
            label={t("dashboard.stats.pendingOffers")}
            value={data.buyer.pendingOffers}
          />
          <StatTile
            icon={<CheckCircle2 />}
            label={t("dashboard.stats.acceptedRequests")}
            value={data.buyer.acceptedRequests}
          />
          <StatTile
            icon={<MessageSquare />}
            label={t("dashboard.stats.inquiries")}
            value={data.buyer.inquiries}
          />
        </div>
      ) : null}

      {data.supplier ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatTile
              icon={<Package />}
              label={t("dashboard.stats.activeProducts")}
              value={data.supplier.activeProducts}
            />
            <StatTile
              icon={<EyeOff />}
              label={t("dashboard.stats.inactiveProducts")}
              value={data.supplier.inactiveProducts}
            />
            <StatTile
              icon={<Send />}
              label={t("dashboard.stats.pendingOffersSupplier")}
              value={data.supplier.pendingOffers}
            />
            <StatTile
              icon={<CheckCircle2 />}
              label={t("dashboard.stats.acceptedOffers")}
              value={data.supplier.acceptedOffers}
            />
            <StatTile
              icon={<MessageSquare />}
              label={t("dashboard.stats.inquiries")}
              value={data.supplier.inquiries}
            />
          </div>
          <section
            aria-labelledby="matching-title"
            className="flex flex-col gap-3"
          >
            <h2 id="matching-title" className="text-xl font-semibold">
              {t("dashboard.matchingTitle")}
            </h2>
            {data.supplier.matchingRequests.length === 0 ? (
              <p className="text-muted-foreground">
                {t("dashboard.matchingEmpty")}
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {data.supplier.matchingRequests.map((request) => (
                  <li
                    key={request.id}
                    className="flex flex-col gap-2 rounded-xl border-2 border-primary/20 bg-card p-4"
                  >
                    <span className="text-lg font-semibold">
                      {request.title}
                    </span>
                    <span className="text-muted-foreground">
                      {request.buyerName} ·{" "}
                      {formatNumber(locale, request.quantity)}{" "}
                      {t(`units.${request.unit}`)} ·{" "}
                      {localizedName(
                        locale,
                        reference.cityById.get(request.cityId),
                      )}{" "}
                      · {formatDate(locale, request.desiredDate)}
                    </span>
                    <Button asChild className="w-fit">
                      <Link href={`/requests/${request.id}`}>
                        {t("dashboard.respond")}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      <section aria-labelledby="activity-title" className="flex flex-col gap-3">
        <h2 id="activity-title" className="text-xl font-semibold">
          {t("dashboard.activityTitle")}
        </h2>
        <ActivityFeed items={data.activity} />
      </section>
    </div>
  );
}

function Dashboard() {
  const t = useTranslations();
  const { user, role } = useSession();
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("overview"),
  );
  const tabs =
    role === "SUPPLIER"
      ? (["overview", "products", "offers", "profile"] as const)
      : (["overview", "requests", "profile"] as const);
  const current = (tabs as readonly string[]).includes(tab) ? tab : "overview";

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-1 border-b pb-6">
        <p className="font-semibold text-primary">{user?.company?.name}</p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          {t("dashboard.greeting", { name: user?.name ?? "" })}
        </h1>
        <p className="text-lg text-muted-foreground">
          {role === "SUPPLIER"
            ? t("dashboard.supplierSubtitle")
            : t("dashboard.buyerSubtitle")}
        </p>
      </div>
      <Tabs
        value={current}
        onValueChange={(value) =>
          void setTab(value === "overview" ? null : value)
        }
      >
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted p-1">
          {tabs.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="min-h-10 px-4 text-[0.95rem]"
            >
              {t(`dashboard.tabs.${key}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="pt-6">
          <Overview />
        </TabsContent>
        <TabsContent value="requests" className="pt-6">
          <MyRequestsList />
        </TabsContent>
        <TabsContent value="products" className="pt-6">
          <MyProductsTable />
        </TabsContent>
        <TabsContent value="offers" className="pt-6">
          <MyOffersList />
        </TabsContent>
        <TabsContent value="profile" className="pt-6">
          <h2 className="mb-4 text-xl font-semibold">
            {t("dashboard.profileTitle")}
          </h2>
          <CompanyProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
