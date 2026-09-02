import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-heading text-6xl">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button render={<Link href="/">Back to Home</Link>} />
    </div>
  );
}
