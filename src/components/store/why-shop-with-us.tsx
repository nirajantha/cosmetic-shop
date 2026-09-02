import { BadgeCheck, MessageCircle, ShieldCheck, Truck } from "lucide-react";

const REASONS = [
  {
    icon: BadgeCheck,
    title: "100% Authentic",
    description: "Every product is sourced directly from authorised brand partners.",
  },
  {
    icon: Truck,
    title: "Fast, Reliable Delivery",
    description: "Carefully packed orders shipped quickly across the country.",
  },
  {
    icon: MessageCircle,
    title: "Order via WhatsApp",
    description: "Chat with us directly to confirm your order — no account needed.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "Your details are handled safely from cart to confirmation.",
  },
];

export function WhyShopWithUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-heading text-2xl">Why Shop With Us</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((reason) => (
          <div key={reason.title} className="flex flex-col items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
              <reason.icon className="size-5" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold">{reason.title}</h3>
            <p className="text-sm text-muted-foreground">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
