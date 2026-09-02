"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-4xl">Something went wrong</p>
      <p className="text-sm text-muted-foreground">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => reset()}>
          Try Again
        </Button>
        <Button render={<Link href="/">Back to Home</Link>} />
      </div>
    </div>
  );
}
