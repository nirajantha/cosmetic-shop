import { FeaturedBrands } from "@/components/store/featured-brands";
import { HeroBanner } from "@/components/store/hero-banner";
import { PromoBanner } from "@/components/store/promo-banner";
import { ProductRail } from "@/components/store/product-rail";
import { ShopByCategory } from "@/components/store/shop-by-category";
import { SocialSection } from "@/components/store/social-section";
import { SpecialOffers } from "@/components/store/special-offers";
import { WhyShopWithUs } from "@/components/store/why-shop-with-us";
import { getFeaturedBrands } from "@/lib/data/brands";
import { getCategoryTree } from "@/lib/data/categories";
import { getActiveOffersForDisplay, getLiveOffersForPricing } from "@/lib/data/offers";
import { getBestSellers, getDiscountedProducts, getFeaturedProducts, getNewArrivals } from "@/lib/data/products";

export default async function Home() {
  const [categoryTree, brands, offers, activeOffers, newArrivals, bestSellers, featured, onSale] =
    await Promise.all([
      getCategoryTree(),
      getFeaturedBrands(),
      getActiveOffersForDisplay(),
      getLiveOffersForPricing(),
      getNewArrivals(),
      getBestSellers(),
      getFeaturedProducts(),
      getDiscountedProducts(),
    ]);

  return (
    <>
      <HeroBanner />
      <ShopByCategory categories={categoryTree} />
      <FeaturedBrands brands={brands} />
      <ProductRail title="New Arrivals" viewAllHref="/products?sort=newest" products={newArrivals} offers={activeOffers} />
      <ProductRail title="Best Sellers" viewAllHref="/products?sort=best-selling" products={bestSellers} offers={activeOffers} />
      <SpecialOffers offers={offers} />
      <ProductRail title="Featured Products" viewAllHref="/products" products={featured} offers={activeOffers} />
      {onSale.length > 0 && (
        <ProductRail title="On Sale" viewAllHref="/products?onSale=true" products={onSale} offers={activeOffers} />
      )}
      <PromoBanner />
      <WhyShopWithUs />
      <SocialSection />
    </>
  );
}
