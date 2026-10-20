# Data Flow

Default data flow:

```txt
UI component
↓
module model query/mutation hook
↓
shared/api/generated
↓
backend
```

## Orval And TanStack Query

- `pnpm orval` generates types, request functions and React Query helpers from
  OpenAPI into `src/shared/api/generated.ts`.
- OpenAPI source is configured with `ORVAL_PATH_URL`; by default it is
  `../backend/uploads/openapi/openapi-spec.json`, written by the backend on start.
- Browser API base URL is configured with `NEXT_PUBLIC_API_URL`.
- HTTP instance and wrappers live in `src/shared/lib/client/`.
- Module hooks in `modules/*/model/queries` and `modules/*/model/mutations`
  import generated functions, assign query keys, invalidate queries and map DTO
  when needed.
- Components do not call generated functions directly.
- Routes do not call generated functions directly. Keep `app/` thin and put
  data orchestration in module hooks or scenario modules.

Example:

```ts
// src/modules/users/model/queries/use-user.ts
import { useQuery } from "@tanstack/react-query";

import { getUserByName } from "@/shared/api/generated";

import { userKeys } from "./user.keys";

export function useUser(username: string) {
  return useQuery({
    queryKey: userKeys.detail(username),
    queryFn: () => getUserByName(username),
    enabled: Boolean(username),
  });
}
```

## Optional Module API Adapter

`modules/*/api` is needed only when generated client is not enough:

- composite request;
- upload/download;
- SSE/WebSocket;
- polling adapter;
- legacy endpoint;
- complex transport mapping that should not live inside a hook.

Do not create module `api/` only to re-export Orval-generated functions.

## Zustand

Zustand stores (`model/stores/*.store.ts`) must not duplicate backend data or
query cache. Server-state belongs in TanStack Query.

Use Zustand only for ephemeral UI-state:

- modal/drawer open state when it is not URL-driven;
- selected IDs for sidebars/details when they do not affect navigation;
- wizard steps;
- temporary local drafts before submit.

## URL State And shadcn Overlays

User-controlled state that affects page content, navigation or data fetching
belongs in the URL through `nuqs`.

```txt
row click
↓
callback(id)
↓
scenario module writes id to URL with nuqs
↓
Boolean(id) controls shadcn overlay
↓
module query hook loads data with enabled: Boolean(id)
```

Scenario parent:

```tsx
"use client";

import { parseAsString, useQueryState } from "nuqs";

import { ItemDetailsDialog } from "@/modules/item-details";
import { ItemsTable } from "@/modules/items";

export function ItemDirectory() {
  const [itemId, setItemId] = useQueryState("item", parseAsString);

  return (
    <>
      <ItemsTable
        onItemClick={(id) => {
          void setItemId(id, { history: "push" });
        }}
      />

      <ItemDetailsDialog
        itemId={itemId}
        open={itemId !== null}
        onOpenChange={(open) => {
          if (!open) {
            void setItemId(null, { history: "replace" });
          }
        }}
      />
    </>
  );
}
```

Base table component:

```tsx
type Props = {
  onItemClick: (itemId: string) => void;
};

export function ItemsTable({ onItemClick }: Props) {
  return (
    <button type="button" onClick={() => onItemClick("123")}>
      Open details
    </button>
  );
}
```

Controlled shadcn dialog:

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { useItemDetails } from "../model/queries/use-item-details";

type Props = {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ItemDetailsDialog({ itemId, open, onOpenChange }: Props) {
  const itemQuery = useItemDetails(itemId ?? "", {
    enabled: open && itemId !== null,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Item details</DialogTitle>
          <DialogDescription>Summary and related activity</DialogDescription>
        </DialogHeader>

        {itemQuery.isPending && <ItemDetailsSkeleton />}
        {itemQuery.isError && <ItemDetailsError />}
        {itemQuery.data && <ItemDetailsContent item={itemQuery.data} />}
      </DialogContent>
    </Dialog>
  );
}
```

Use `history: "push"` when opening an overlay so browser Back closes it. Use
`history: "replace"` on ordinary close so Back does not reopen a just-closed
overlay.

`DialogTrigger` is needed only when the trigger is colocated with the dialog.
For tables/lists, prefer one controlled overlay driven by the scenario parent.
