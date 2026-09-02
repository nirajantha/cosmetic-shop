"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-heading text-3xl">Something went wrong</p>
      <p className="text-sm text-muted-foreground">This admin page hit an unexpected error.</p>
      <Button variant="outline" onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
