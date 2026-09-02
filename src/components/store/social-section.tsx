import Image from "next/image";

const GALLERY_SEEDS = ["gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5", "gallery-6"];

export function SocialSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h2 className="font-heading text-2xl">Tag us @aurelle.beauty</h2>
        <p className="mt-1 text-sm text-muted-foreground">Share your routine for a chance to be featured.</p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
        {GALLERY_SEEDS.map((seed) => (
          <div key={seed} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={`https://picsum.photos/seed/${seed}/400/400`}
              alt="Customer beauty routine shared on social media"
              fill
              sizes="(min-width: 768px) 16vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
