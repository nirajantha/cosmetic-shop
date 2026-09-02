import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductPaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  basePath?: string;
}

function hrefForPage(page: number, searchParams: Record<string, string | undefined>, basePath: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ""}`;
}

export function ProductPagination({ page, totalPages, searchParams, basePath = "/products" }: ProductPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hrefForPage(Math.max(1, page - 1), searchParams, basePath)}
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {pages.map((p, index) => (
          <PaginationItem key={p}>
            {index > 0 && pages[index - 1] !== p - 1 && <PaginationEllipsis />}
            <PaginationLink href={hrefForPage(p, searchParams, basePath)} isActive={p === page}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={hrefForPage(Math.min(totalPages, page + 1), searchParams, basePath)}
            aria-disabled={page === totalPages}
            className={page === totalPages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
