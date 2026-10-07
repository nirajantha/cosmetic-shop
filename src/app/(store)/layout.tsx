import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

// Render store pages per request instead of prerendering them at build time, so
// `next build` never needs a database connection (the cPanel build runs on a machine
// that can't reach the production DB). Header/footer data stays cached via unstable_cache.
export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </>
  );
}
