"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/modules/session";
import { Field } from "@/shared/components/field";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Link, useRouter } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";

import { useStartInquiry } from "../model/mutations/use-inquiry-mutations";

type StartInquiryDialogProps = {
  toCompanyId: string;
  companyName: string;
  productId?: string;
  requestId?: string;
  defaultSubject: string;
  label?: string;
  variant?: "default" | "outline";
  loginNext: string;
};

export function StartInquiryDialog({
  toCompanyId,
  companyName,
  productId,
  requestId,
  defaultSubject,
  label,
  variant = "outline",
  loginNext,
}: StartInquiryDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const { user, companyId } = useSession();
  const start = useStartInquiry();
  const errorMessage = useErrorMessage();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const buttonLabel = label ?? t("common.contact");

  if (companyId === toCompanyId) {
    return null;
  }

  if (!user) {
    return (
      <Button asChild variant={variant} size="lg">
        <Link href={{ pathname: "/login", query: { next: loginNext } }}>
          <MessageSquare aria-hidden />
          {buttonLabel}
        </Link>
      </Button>
    );
  }

  const submit = () => {
    if (message.trim().length === 0 || subject.trim().length < 2) {
      setError(t("validation.required"));
      return;
    }

    start.mutate(
      {
        toCompanyId,
        productId,
        requestId,
        subject: subject.trim(),
        message: message.trim(),
      },
      {
        onSuccess: (inquiry) => {
          toast.success(t("inquiries.sent"));
          setOpen(false);
          router.push(`/inquiries/${inquiry.id}`);
        },
        onError: (err) => setError(errorMessage(err)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="lg">
          <MessageSquare aria-hidden />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t("common.close")}>
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t("inquiries.startTitle", { company: companyName })}
          </DialogTitle>
          <DialogDescription>{t("inquiries.subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Field id="inq-subject" label={t("inquiries.subject")}>
            <Input
              id="inq-subject"
              value={subject}
              maxLength={150}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field
            id="inq-message"
            label={t("inquiries.message")}
            error={error ?? undefined}
          >
            <Textarea
              id="inq-message"
              rows={5}
              maxLength={2000}
              value={message}
              placeholder={t("inquiries.messagePlaceholder")}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "inq-message-error" : undefined}
              onChange={(e) => {
                setMessage(e.target.value);
                setError(null);
              }}
            />
          </Field>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={start.isPending}>
            {start.isPending ? t("common.sending") : t("common.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
