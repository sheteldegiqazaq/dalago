"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type PaginationProps = {
  page: number;
  total: number;
  limit: number;
  labels: { previous: string; next: string; status: string };
  onChange: (page: number) => void;
};

export function Pagination({
  page,
  total,
  limit,
  labels,
  onChange,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit));

  if (pages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center gap-3"
      aria-label={labels.status}
    >
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft aria-hidden />
        {labels.previous}
      </Button>
      <span className="text-base text-muted-foreground" aria-live="polite">
        {labels.status}
      </span>
      <Button
        variant="outline"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        {labels.next}
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}
