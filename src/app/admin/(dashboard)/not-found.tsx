import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-heading text-3xl">Not Found</p>
      <p className="text-sm text-muted-foreground">That record doesn&apos;t exist or may have been removed.</p>
      <Link href="/admin/dashboard" className={buttonVariants()}>Back to Dashboard</Link>
    </div>
  );
}
