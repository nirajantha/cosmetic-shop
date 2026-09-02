"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/actions/types";

interface ConfirmActionButtonProps {
  label: string;
  title: string;
  description: string;
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary";
  action: () => Promise<ActionResult>;
  successMessage?: string;
}

export function ConfirmActionButton({
  label,
  title,
  description,
  variant = "destructive",
  action,
  successMessage,
}: ConfirmActionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    const result = await action();
    setPending(false);
    setOpen(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(result.message ?? successMessage ?? "Done.");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant={variant} size="sm" />}>{label}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" variant={variant} disabled={pending} onClick={handleConfirm}>
            {pending ? "Working..." : label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
