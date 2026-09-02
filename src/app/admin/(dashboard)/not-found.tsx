import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-heading text-3xl">Not Found</p>
      <p className="text-sm text-muted-foreground">That record doesn&apos;t exist or may have been removed.</p>
      <Button render={<Link href="/admin/dashboard">Back to Dashboard</Link>} />
    </div>
  );
}
