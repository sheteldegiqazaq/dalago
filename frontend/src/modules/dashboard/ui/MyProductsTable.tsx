"use client";

import { Eye, EyeOff, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { CategoryIcon, localizedTitle } from "@/entities/catalog";
import { ProductStatusBadge } from "@/entities/procurement";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { formatMoney, formatNumber } from "@/shared/lib/format";
import {
  useDeleteProduct,
  useSetProductStatus,
} from "../model/mutations/use-dashboard-mutations";
import { useMyProducts } from "../model/queries/use-dashboard";
import type { ProductListItemDto } from "../model/types";

export function MyProductsTable() {
  const t = useTranslations();
  const locale = useLocale();
  const products = useMyProducts();
  const setStatus = useSetProductStatus();
  const remove = useDeleteProduct();
  const errorMessage = useErrorMessage();
  const [toDelete, setToDelete] = useState<ProductListItemDto | null>(null);

  if (products.isPending) {
    return <LoadingBlock label={t("common.loading")} />;
  }

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <Link href="/dashboard/products/new">
          <Sparkles aria-hidden />
          {t("dashboard.newProductAi")}
        </Link>
      </Button>
    </div>
  );

  if (!products.data?.length) {
    return (
      <EmptyState
        icon={<Plus />}
        title={t("dashboard.productsEmpty")}
        action={actions}
      />
    );
  }

  const toggle = (product: ProductListItemDto) => {
    const status = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setStatus.mutate(
      { id: product.id, status },
      {
        onSuccess: () =>
          toast.success(
            status === "ACTIVE"
              ? t("dashboard.activated")
              : t("dashboard.deactivated"),
          ),
        onError: (error) => toast.error(errorMessage(error)),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {actions}
      <ul className="flex flex-col gap-3">
        {products.data.map((product) => {
          const title = localizedTitle(locale, product);
          const unit = t(`units.${product.unit}`);

          return (
            <li
              key={product.id}
              className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <CategoryIcon
                    icon={product.category.icon}
                    className="size-5"
                  />
                </span>
                <div className="flex flex-col">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-semibold hover:text-primary hover:underline"
                  >
                    {title}
                  </Link>
                  <ProductStatusBadge status={product.status} />
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.productColumns.price")}
                </span>
                <p className="font-semibold">
                  {formatMoney(locale, product.price)} / {unit}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  {t("dashboard.productColumns.stock")}
                </span>
                <p className="font-semibold">
                  {formatNumber(locale, product.availableQty)} {unit}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <Pencil aria-hidden />
                    {t("common.edit")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggle(product)}
                  disabled={setStatus.isPending}
                >
                  {product.status === "ACTIVE" ? (
                    <EyeOff aria-hidden />
                  ) : (
                    <Eye aria-hidden />
                  )}
                  {product.status === "ACTIVE"
                    ? t("dashboard.deactivate")
                    : t("dashboard.activate")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setToDelete(product)}
                >
                  <Trash2 aria-hidden />
                  {t("common.delete")}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t("dashboard.deleteConfirmTitle")}
        description={
          toDelete
            ? t("dashboard.deleteConfirmText", {
                title: localizedTitle(locale, toDelete),
              })
            : undefined
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        pending={remove.isPending}
        onConfirm={() =>
          toDelete &&
          remove.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success(t("dashboard.deleted"));
              setToDelete(null);
            },
            onError: (error) => toast.error(errorMessage(error)),
          })
        }
      />
    </div>
  );
}
