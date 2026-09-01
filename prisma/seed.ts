import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/utils";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

function placeholderImages(seed: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    url: `https://picsum.photos/seed/${seed}-${i + 1}/900/1100`,
    sortOrder: i,
  }));
}

const CATEGORY_TREE: { name: string; children: string[] }[] = [
  {
    name: "Makeup",
    children: ["Face", "Eyes", "Lips", "Foundation", "Concealer", "Blush", "Mascara", "Eyeliner"],
  },
  {
    name: "Skincare",
    children: ["Cleanser", "Toner", "Serum", "Moisturizer", "Sunscreen", "Eye Care", "Masks"],
  },
  { name: "Hair", children: ["Shampoo", "Conditioner", "Hair Treatment"] },
  { name: "Body", children: ["Body Wash", "Body Lotion", "Scrub"] },
  { name: "Accessories", children: ["Brushes", "Sponges", "Tools"] },
];

const BRANDS = [
  { name: "COSRX", description: "Korean skincare focused on gentle, effective, minimal-ingredient formulas." },
  { name: "Beauty of Joseon", description: "Korean skincare inspired by traditional Hanbang ingredients." },
  { name: "Anua", description: "Korean skincare centered on heartleaf and other soothing botanicals." },
  { name: "Maybelline", description: "Accessible, trend-driven color cosmetics for every day." },
  { name: "L'Oréal", description: "Global beauty brand spanning skincare, haircare and makeup." },
  { name: "CeraVe", description: "Dermatologist-developed skincare with ceramides for every skin type." },
  { name: "The Ordinary", description: "Clinical-grade, single-ingredient-focused skincare at honest prices." },
];

type SeedProduct = {
  name: string;
  brand: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  outOfStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  shortDescription: string;
  description: string;
  ingredients: string;
  howToUse: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "COSRX Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    category: "Serum",
    price: 2900,
    salePrice: 2400,
    stock: 40,
    featured: true,
    isBestSeller: true,
    shortDescription: "A lightweight essence with 96% snail secretion filtrate for repair and hydration.",
    description:
      "This cult-favourite essence delivers 96% snail secretion filtrate deep into the skin to visibly repair dryness, fine lines and dullness, leaving skin plump and dewy without any heaviness.",
    ingredients: "Snail Secretion Filtrate 96%, Betaine, Sodium Hyaluronate, Panthenol, Arginine.",
    howToUse: "After toner, pat 2-3 drops onto face and neck. Follow with moisturizer.",
  },
  {
    name: "COSRX Salicylic Acid Daily Gentle Cleanser",
    brand: "COSRX",
    category: "Cleanser",
    price: 1450,
    stock: 60,
    shortDescription: "A low-pH gel cleanser with BHA to clear pores without stripping the skin.",
    description:
      "A daily gel cleanser formulated with salicylic acid and low pH to gently exfoliate inside pores, remove excess sebum and leave skin clean and balanced.",
    ingredients: "Salicylic Acid, Betaine Salicylate, Tea Tree Leaf Water, Panthenol.",
    howToUse: "Massage onto damp skin morning and night, then rinse thoroughly.",
  },
  {
    name: "COSRX AHA/BHA Clarifying Treatment Toner",
    brand: "COSRX",
    category: "Toner",
    price: 1690,
    stock: 35,
    isNew: true,
    shortDescription: "An exfoliating toner that smooths texture and refines pores.",
    description:
      "A leave-on exfoliating toner combining AHA and BHA to sweep away dead skin cells, refine visible pores and prep skin for the rest of your routine.",
    ingredients: "Glycolic Acid, Betaine Salicylate, Butylene Glycol, Camellia Sinensis Leaf Extract.",
    howToUse: "Sweep across cleansed skin with a cotton pad, avoiding the eye area. Use in the evening.",
  },
  {
    name: "COSRX Aloe Soothing Sun Cream SPF50",
    brand: "COSRX",
    category: "Sunscreen",
    price: 1850,
    stock: 0,
    outOfStock: true,
    shortDescription: "A lightweight, non-greasy sunscreen with soothing aloe.",
    description:
      "A broad-spectrum SPF50 sunscreen with a fluid, non-greasy finish and calming aloe extract, ideal for daily wear under makeup.",
    ingredients: "Aloe Barbadensis Leaf Water, Niacinamide, UV filters (broad spectrum SPF50/PA+++).",
    howToUse: "Apply generously as the last step of your morning routine and reapply every few hours in direct sun.",
  },
  {
    name: "COSRX Pure Fit Cica Serum",
    brand: "COSRX",
    category: "Serum",
    price: 2100,
    stock: 25,
    shortDescription: "A calming centella serum for redness-prone, sensitive skin.",
    description:
      "Formulated with a high concentration of Centella Asiatica extract to calm visible redness and strengthen the skin barrier over time.",
    ingredients: "Centella Asiatica Extract, Panthenol, Madecassoside, Allantoin.",
    howToUse: "Apply after toner, focusing on areas of redness or irritation.",
  },
  {
    name: "COSRX Full Fit Propolis Light Ampule",
    brand: "COSRX",
    category: "Serum",
    price: 2450,
    stock: 22,
    isNew: true,
    shortDescription: "A lightweight ampule with 65% propolis extract for glow and nourishment.",
    description:
      "A fast-absorbing ampule packed with propolis extract to nourish, brighten and add lasting radiance without any sticky residue.",
    ingredients: "Propolis Extract 65%, Niacinamide, Adenosine, Sodium Hyaluronate.",
    howToUse: "Pat 2-3 drops onto face after toner, morning and night.",
  },
  {
    name: "Beauty of Joseon Glow Serum Propolis + Niacinamide",
    brand: "Beauty of Joseon",
    category: "Serum",
    price: 2200,
    salePrice: 1890,
    stock: 50,
    featured: true,
    isBestSeller: true,
    shortDescription: "A brightening serum blending propolis and niacinamide for radiant skin.",
    description:
      "A best-selling glow serum that pairs nourishing propolis with niacinamide to visibly brighten, even out tone and add a healthy, dewy finish.",
    ingredients: "Propolis Extract, Niacinamide 2%, Sodium Hyaluronate, Panthenol.",
    howToUse: "Apply 2-3 drops after toner both morning and evening.",
  },
  {
    name: "Beauty of Joseon Relief Sun Rice + Probiotics SPF50",
    brand: "Beauty of Joseon",
    category: "Sunscreen",
    price: 2450,
    stock: 45,
    isBestSeller: true,
    shortDescription: "A rice-infused sunscreen with a dewy, no-white-cast finish.",
    description:
      "A beloved daily sunscreen enriched with rice extract and probiotics, offering broad-spectrum protection with a radiant, hydrating finish.",
    ingredients: "Rice Extract, Niacinamide, Probiotic Ferment Extract, UV filters (SPF50+/PA++++).",
    howToUse: "Apply as the final step of your morning skincare routine, reapplying as needed.",
  },
  {
    name: "Beauty of Joseon Dynasty Cream",
    brand: "Beauty of Joseon",
    category: "Moisturizer",
    price: 2600,
    stock: 20,
    isNew: true,
    shortDescription: "A rich ginseng and snail mucin cream for deep nourishment.",
    description:
      "A luxuriously rich moisturizer combining ginseng and snail mucin to deeply nourish, firm and restore radiance to tired, dehydrated skin.",
    ingredients: "Ginseng Root Extract, Snail Secretion Filtrate, Shea Butter, Adenosine.",
    howToUse: "Warm a small amount between palms and press into the last step of your evening routine.",
  },
  {
    name: "Beauty of Joseon Radiance Cleansing Balm",
    brand: "Beauty of Joseon",
    category: "Cleanser",
    price: 1990,
    stock: 30,
    shortDescription: "A melting cleansing balm that lifts makeup and sunscreen with ease.",
    description:
      "A rich balm that melts into oil on contact, dissolving makeup, sunscreen and impurities without stripping the skin's natural moisture.",
    ingredients: "Rice Bran Oil, Ginseng Root Extract, Camellia Japonica Seed Oil.",
    howToUse: "Massage onto dry skin, add water to emulsify, then rinse thoroughly.",
  },
  {
    name: "Beauty of Joseon Red Bean Water Gel",
    brand: "Beauty of Joseon",
    category: "Moisturizer",
    price: 2050,
    stock: 18,
    shortDescription: "A refreshing water gel that hydrates and tightens pores.",
    description:
      "A lightweight gel moisturizer infused with red bean extract to hydrate, refine the look of pores and leave a smooth, matte-fresh finish.",
    ingredients: "Red Bean Extract, Adenosine, Betaine, Sodium Hyaluronate.",
    howToUse: "Apply as the last step of your routine, morning or night.",
  },
  {
    name: "Anua Heartleaf 77% Soothing Toner",
    brand: "Anua",
    category: "Toner",
    price: 1990,
    salePrice: 1590,
    stock: 55,
    featured: true,
    isBestSeller: true,
    shortDescription: "A calming toner with 77% heartleaf extract for sensitive skin.",
    description:
      "A gentle, alcohol-free toner formulated with 77% heartleaf water to calm redness, hydrate and prep skin for the rest of your routine.",
    ingredients: "Houttuynia Cordata Extract 77%, Panthenol, Betaine, Allantoin.",
    howToUse: "Sweep over cleansed skin with a cotton pad or pat in with hands.",
  },
  {
    name: "Anua Heartleaf Pore Control Cleansing Oil",
    brand: "Anua",
    category: "Cleanser",
    price: 2150,
    stock: 30,
    isNew: true,
    shortDescription: "A cleansing oil that clears pores while staying gentle on skin.",
    description:
      "A lightweight cleansing oil that dissolves sunscreen, makeup and sebum buildup deep within pores, leaving skin clean and calm.",
    ingredients: "Houttuynia Cordata Extract, Olive Oil, Jojoba Seed Oil.",
    howToUse: "Massage onto dry face, emulsify with water, then rinse or follow with a water-based cleanser.",
  },
  {
    name: "Anua Peach 70% Niacinamide Serum",
    brand: "Anua",
    category: "Serum",
    price: 2300,
    stock: 0,
    outOfStock: true,
    shortDescription: "A brightening serum with peach extract and niacinamide.",
    description:
      "A fast-absorbing serum blending peach extract with niacinamide to visibly brighten, refine pores and even out skin tone.",
    ingredients: "Peach Extract 70%, Niacinamide 10%, Panthenol.",
    howToUse: "Apply a few drops after toner, morning and night.",
  },
  {
    name: "Anua Rice Enzyme Powder Wash",
    brand: "Anua",
    category: "Cleanser",
    price: 1750,
    stock: 20,
    shortDescription: "A gentle enzyme powder cleanser that polishes as it cleans.",
    description:
      "An activated-on-contact enzyme powder that gently polishes away dead skin cells and residue for soft, evenly toned skin.",
    ingredients: "Rice Extract, Papain, Kaolin Clay.",
    howToUse: "Mix a small amount with water to form a foam, massage onto face, then rinse.",
  },
  {
    name: "Anua Azelaic Acid 10% Serum",
    brand: "Anua",
    category: "Serum",
    price: 2600,
    stock: 12,
    shortDescription: "A targeted serum for uneven tone and post-blemish marks.",
    description:
      "A concentrated azelaic acid serum that helps visibly fade the look of post-blemish marks and even out overall skin tone.",
    ingredients: "Azelaic Acid 10%, Niacinamide, Centella Asiatica Extract.",
    howToUse: "Apply a thin layer to clean skin in the evening, following with moisturizer.",
  },
  {
    name: "Maybelline Fit Me Matte + Poreless Foundation",
    brand: "Maybelline",
    category: "Foundation",
    price: 1650,
    stock: 70,
    isBestSeller: true,
    shortDescription: "A natural matte foundation that blurs the look of pores.",
    description:
      "A lightweight, buildable foundation that mattifies shine and blurs the appearance of pores for a natural, poreless-looking finish.",
    ingredients: "Silica, Dimethicone, Glycerin.",
    howToUse: "Blend onto skin with a brush, sponge or fingertips, building coverage as needed.",
  },
  {
    name: "Maybelline SuperStay Matte Ink Lipstick",
    brand: "Maybelline",
    category: "Lips",
    price: 1450,
    salePrice: 1150,
    stock: 65,
    featured: true,
    shortDescription: "A long-wearing liquid lipstick with a soft matte finish.",
    description:
      "An up-to-16-hour liquid lipstick with an intense matte finish that resists fading, feathering and transferring throughout the day.",
    ingredients: "Isododecane, Trimethylsiloxysilicate, Pigments.",
    howToUse: "Apply from the center of the lips outward in one smooth layer. Let set before touching.",
  },
  {
    name: "Maybelline Lash Sensational Sky High Mascara",
    brand: "Maybelline",
    category: "Mascara",
    price: 1550,
    stock: 40,
    isBestSeller: true,
    shortDescription: "A volumizing, lengthening mascara with a flexible brush.",
    description:
      "A fibre-infused formula and flexible brush combine to lift, lengthen and add dramatic volume to every lash.",
    ingredients: "Bamboo Fiber, Beeswax, Panthenol.",
    howToUse: "Wiggle the brush at the root and sweep upward through the lashes.",
  },
  {
    name: "Maybelline Fit Me Concealer",
    brand: "Maybelline",
    category: "Concealer",
    price: 1200,
    stock: 55,
    shortDescription: "A natural-finish concealer that covers without creasing.",
    description:
      "A lightweight liquid concealer that evens out tone and covers imperfections while blending seamlessly into skin.",
    ingredients: "Dimethicone, Glycerin, Titanium Dioxide.",
    howToUse: "Dot onto areas needing coverage and blend with a sponge or brush.",
  },
  {
    name: "Maybelline Hyper Sharp Liner",
    brand: "Maybelline",
    category: "Eyeliner",
    price: 990,
    stock: 45,
    isNew: true,
    shortDescription: "A precision felt-tip liner for a sharp, defined line.",
    description:
      "An ultra-fine felt tip delivers a precise, intensely black line with a matte finish that lasts all day.",
    ingredients: "Water, Acrylates Copolymer, Carbon Black.",
    howToUse: "Draw along the lash line, starting thin and building thickness toward the outer corner.",
  },
  {
    name: "Maybelline Baby Lips Moisturizing Lip Balm",
    brand: "Maybelline",
    category: "Lips",
    price: 550,
    stock: 90,
    isBestSeller: true,
    shortDescription: "A tinted lip balm that hydrates while adding a hint of colour.",
    description:
      "A quick-absorbing lip balm with SPF that moisturizes dry lips while leaving behind a subtle wash of colour.",
    ingredients: "Shea Butter, Beeswax, Vitamin E.",
    howToUse: "Swipe directly onto lips as needed throughout the day.",
  },
  {
    name: "L'Oréal Revitalift Hyaluronic Acid Serum",
    brand: "L'Oréal",
    category: "Serum",
    price: 2750,
    stock: 0,
    outOfStock: true,
    shortDescription: "A plumping serum with pure hyaluronic acid.",
    description:
      "A concentrated serum with pure hyaluronic acid that plumps fine lines and delivers lasting hydration for smoother-looking skin.",
    ingredients: "Hyaluronic Acid, Glycerin, Vitamin B5.",
    howToUse: "Apply to cleansed face and neck morning and night before moisturizer.",
  },
  {
    name: "L'Oréal True Match Foundation",
    brand: "L'Oréal",
    category: "Foundation",
    price: 2100,
    salePrice: 1790,
    stock: 25,
    featured: true,
    shortDescription: "A skin-like foundation available in an extensive shade range.",
    description:
      "A lightweight, buildable foundation formulated to match skin tone and texture precisely for a natural, second-skin finish.",
    ingredients: "Glycerin, Dimethicone, SPF filters.",
    howToUse: "Apply with a brush or sponge, building coverage from the center of the face outward.",
  },
  {
    name: "L'Oréal Voluminous Lash Paradise Mascara",
    brand: "L'Oréal",
    category: "Mascara",
    price: 1990,
    stock: 38,
    shortDescription: "A soft-bristle mascara for feather-light volume.",
    description:
      "A collagen-infused formula on a soft, feather-like brush builds intense volume without clumping or flaking.",
    ingredients: "Collagen, Beeswax, Panthenol.",
    howToUse: "Apply in a zig-zag motion from root to tip.",
  },
  {
    name: "L'Oréal Age Perfect Rosy Tone Moisturizer",
    brand: "L'Oréal",
    category: "Moisturizer",
    price: 2450,
    stock: 20,
    shortDescription: "A rosy-toned moisturizer that hydrates mature skin.",
    description:
      "A rich daily moisturizer formulated for mature skin, delivering hydration while imparting a subtle, healthy rosy glow.",
    ingredients: "Glycerin, Niacinamide, Shea Butter.",
    howToUse: "Apply to face and neck each morning after cleansing.",
  },
  {
    name: "L'Oréal Elvive Total Repair 5 Shampoo",
    brand: "L'Oréal",
    category: "Shampoo",
    price: 1250,
    stock: 50,
    shortDescription: "A repairing shampoo for damaged, weakened hair.",
    description:
      "A nourishing shampoo formulated with ceramide and protein to target five signs of hair damage, leaving hair stronger and smoother.",
    ingredients: "Ceramide, Protein Complex, Glycerin.",
    howToUse: "Massage into wet hair, lather, then rinse thoroughly. Follow with conditioner.",
  },
  {
    name: "L'Oréal Elvive Total Repair 5 Conditioner",
    brand: "L'Oréal",
    category: "Conditioner",
    price: 1250,
    stock: 45,
    shortDescription: "A repairing conditioner that smooths and strengthens hair.",
    description:
      "A rich conditioner that detangles and smooths hair while helping to repair the look of damage from root to tip.",
    ingredients: "Ceramide, Protein Complex, Dimethicone.",
    howToUse: "Apply from mid-length to ends after shampooing, leave for 1-2 minutes, then rinse.",
  },
  {
    name: "CeraVe Foaming Facial Cleanser",
    brand: "CeraVe",
    category: "Cleanser",
    price: 1890,
    stock: 60,
    isBestSeller: true,
    shortDescription: "A foaming cleanser with ceramides for normal to oily skin.",
    description:
      "A gel-to-foam cleanser developed with dermatologists, formulated with three essential ceramides and hyaluronic acid to cleanse without disrupting the skin barrier.",
    ingredients: "Ceramides NP, AP, EOP, Hyaluronic Acid, Niacinamide.",
    howToUse: "Massage onto damp skin, work into a lather, then rinse with lukewarm water.",
  },
  {
    name: "CeraVe Moisturizing Cream",
    brand: "CeraVe",
    category: "Moisturizer",
    price: 2350,
    stock: 55,
    isBestSeller: true,
    shortDescription: "A rich, ceramide-packed cream for dry to very dry skin.",
    description:
      "A fragrance-free, rich cream with three essential ceramides and hyaluronic acid that provides 24-hour hydration and helps restore the skin barrier.",
    ingredients: "Ceramides NP, AP, EOP, Hyaluronic Acid, Petrolatum.",
    howToUse: "Apply liberally to face and body as often as needed.",
  },
  {
    name: "CeraVe Hydrating Mineral Sunscreen SPF50",
    brand: "CeraVe",
    category: "Sunscreen",
    price: 2600,
    stock: 35,
    isNew: true,
    shortDescription: "A mineral sunscreen with ceramides for sensitive skin.",
    description:
      "A 100% mineral sunscreen formulated with ceramides and niacinamide to protect and hydrate while being gentle on sensitive skin.",
    ingredients: "Zinc Oxide, Titanium Dioxide, Ceramides, Niacinamide.",
    howToUse: "Apply generously 15 minutes before sun exposure and reapply every two hours.",
  },
  {
    name: "CeraVe Eye Repair Cream",
    brand: "CeraVe",
    category: "Eye Care",
    price: 2900,
    stock: 15,
    shortDescription: "A fragrance-free cream that hydrates the delicate eye area.",
    description:
      "A gentle, fragrance-free eye cream with ceramides and hyaluronic acid formulated to smooth and hydrate the delicate skin around the eyes.",
    ingredients: "Ceramides, Hyaluronic Acid, Niacinamide.",
    howToUse: "Gently pat a small amount around the orbital bone morning and night.",
  },
  {
    name: "CeraVe Hydrating Body Wash",
    brand: "CeraVe",
    category: "Body Wash",
    price: 1850,
    stock: 40,
    shortDescription: "A soap-free body wash with ceramides for dry skin.",
    description:
      "A non-drying body wash that cleanses while helping restore the skin's natural barrier with three essential ceramides and hyaluronic acid.",
    ingredients: "Ceramides NP, AP, EOP, Hyaluronic Acid.",
    howToUse: "Massage onto wet skin in the shower or bath, then rinse thoroughly.",
  },
  {
    name: "CeraVe Moisturizing Body Lotion",
    brand: "CeraVe",
    category: "Body Lotion",
    price: 2100,
    stock: 35,
    isNew: true,
    shortDescription: "A fast-absorbing lotion with ceramides for all-day hydration.",
    description:
      "A lightweight, non-greasy lotion that absorbs quickly to provide 24-hour hydration while helping restore the skin's protective barrier.",
    ingredients: "Ceramides NP, AP, EOP, Hyaluronic Acid, Glycerin.",
    howToUse: "Apply liberally to the body as often as needed, especially after bathing.",
  },
  {
    name: "The Ordinary Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Serum",
    price: 990,
    salePrice: 790,
    stock: 80,
    featured: true,
    isBestSeller: true,
    shortDescription: "A high-strength blemish and pore-refining serum.",
    description:
      "A concentrated water-based formula with niacinamide and zinc to visibly reduce the look of blemishes and balance oily areas.",
    ingredients: "Niacinamide 10%, Zinc PCA 1%.",
    howToUse: "Apply a few drops to the face morning and evening before heavier creams.",
  },
  {
    name: "The Ordinary Hyaluronic Acid 2% + B5",
    brand: "The Ordinary",
    category: "Serum",
    price: 1090,
    stock: 70,
    shortDescription: "A multi-depth hydrating serum with hyaluronic acid.",
    description:
      "A hydration formula with multiple forms of hyaluronic acid plus vitamin B5 to support skin's natural moisture at multiple levels.",
    ingredients: "Sodium Hyaluronate, Panthenol, Hyaluronic Acid Crosspolymer.",
    howToUse: "Apply to damp skin morning and night before heavier creams.",
  },
  {
    name: "The Ordinary Glycolic Acid 7% Toning Solution",
    brand: "The Ordinary",
    category: "Toner",
    price: 1290,
    stock: 40,
    isNew: true,
    shortDescription: "An exfoliating toner that improves radiance and texture.",
    description:
      "A leave-on exfoliating toning solution with glycolic acid that gently sloughs away dullness for smoother, more radiant-looking skin.",
    ingredients: "Glycolic Acid 7%, Aloe Vera Leaf Water, Ginseng Root Extract.",
    howToUse: "Sweep over the face in the evening using a cotton pad, avoiding the eye area.",
  },
  {
    name: "The Ordinary Squalane Cleanser",
    brand: "The Ordinary",
    category: "Cleanser",
    price: 1150,
    stock: 0,
    outOfStock: true,
    shortDescription: "A gentle, hydrating cleanser that respects the skin barrier.",
    description:
      "A lightweight, hydrating cleanser that removes makeup and impurities without disrupting the skin's natural moisture barrier.",
    ingredients: "Squalane, Glycerin, Coco-Glucoside.",
    howToUse: "Massage onto dry or damp skin, then rinse with lukewarm water.",
  },
];

const OFFERS: {
  title: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  brand?: string;
  category?: string;
  products?: string[];
}[] = [
  {
    title: "20% OFF COSRX",
    description: "Save on the full COSRX range for a limited time.",
    type: "PERCENTAGE",
    value: 20,
    startDate: daysFromNow(-5),
    endDate: daysFromNow(25),
    isActive: true,
    brand: "COSRX",
  },
  {
    title: "Rs. 500 OFF Skincare",
    description: "Flat Rs. 500 off every skincare essential.",
    type: "FIXED_AMOUNT",
    value: 500,
    startDate: daysFromNow(-2),
    endDate: daysFromNow(20),
    isActive: true,
    category: "Skincare",
  },
  {
    title: "15% OFF Selected Products",
    description: "Hand-picked favourites at 15% off.",
    type: "PERCENTAGE",
    value: 15,
    startDate: daysFromNow(-1),
    endDate: daysFromNow(14),
    isActive: true,
    products: [
      "The Ordinary Niacinamide 10% + Zinc 1%",
      "Anua Heartleaf 77% Soothing Toner",
      "Maybelline SuperStay Matte Ink Lipstick",
    ],
  },
  {
    title: "Weekend Sale",
    description: "Our best sellers, discounted for the weekend only.",
    type: "PERCENTAGE",
    value: 10,
    startDate: daysFromNow(-1),
    endDate: daysFromNow(3),
    isActive: true,
    products: [
      "COSRX Advanced Snail 96 Mucin Power Essence",
      "CeraVe Moisturizing Cream",
      "Maybelline Fit Me Matte + Poreless Foundation",
    ],
  },
  {
    title: "New Arrival Offer",
    description: "Introductory pricing on our newest arrivals.",
    type: "FIXED_AMOUNT",
    value: 200,
    startDate: daysFromNow(-3),
    endDate: daysFromNow(11),
    isActive: true,
    products: [
      "COSRX AHA/BHA Clarifying Treatment Toner",
      "CeraVe Hydrating Mineral Sunscreen SPF50",
    ],
  },
  {
    title: "Holiday Prep Sale",
    description: "Get ready for the season with 25% off makeup.",
    type: "PERCENTAGE",
    value: 25,
    startDate: daysFromNow(14),
    endDate: daysFromNow(30),
    isActive: true,
    category: "Makeup",
  },
  {
    title: "Summer Skin Refresh",
    description: "Our summer body-care promotion has ended — thank you!",
    type: "FIXED_AMOUNT",
    value: 300,
    startDate: daysFromNow(-60),
    endDate: daysFromNow(-30),
    isActive: true,
    category: "Body",
  },
];

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
  const passwordHash = await bcrypt.hash(password, 12);

  await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Store Admin" },
  });

  console.log(`Admin user ready: ${email}`);
}

async function seedCategories() {
  const categoryIdByName = new Map<string, string>();

  for (const parent of CATEGORY_TREE) {
    const parentRecord = await db.category.upsert({
      where: { slug: slugify(parent.name) },
      update: {},
      create: { name: parent.name, slug: slugify(parent.name) },
    });
    categoryIdByName.set(parent.name, parentRecord.id);

    for (const [index, childName] of parent.children.entries()) {
      const childRecord = await db.category.upsert({
        where: { slug: slugify(childName) },
        update: { parentId: parentRecord.id },
        create: {
          name: childName,
          slug: slugify(childName),
          parentId: parentRecord.id,
          sortOrder: index,
        },
      });
      categoryIdByName.set(childName, childRecord.id);
    }
  }

  console.log(`Seeded ${categoryIdByName.size} categories.`);
  return categoryIdByName;
}

async function seedBrands() {
  const brandIdByName = new Map<string, string>();

  for (const brand of BRANDS) {
    const record = await db.brand.upsert({
      where: { slug: slugify(brand.name) },
      update: {},
      create: { name: brand.name, slug: slugify(brand.name), description: brand.description },
    });
    brandIdByName.set(brand.name, record.id);
  }

  console.log(`Seeded ${brandIdByName.size} brands.`);
  return brandIdByName;
}

async function seedProducts(
  categoryIdByName: Map<string, string>,
  brandIdByName: Map<string, string>
) {
  const productIdByName = new Map<string, string>();

  for (const [index, product] of PRODUCTS.entries()) {
    const categoryId = categoryIdByName.get(product.category);
    const brandId = brandIdByName.get(product.brand);
    if (!categoryId || !brandId) {
      throw new Error(`Missing category/brand for product "${product.name}"`);
    }

    const slug = slugify(product.name);
    const sku = `${slugify(product.brand).toUpperCase().slice(0, 4)}-${String(index + 1).padStart(4, "0")}`;

    const record = await db.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: product.name,
        slug,
        sku,
        description: product.description,
        shortDescription: product.shortDescription,
        ingredients: product.ingredients,
        howToUse: product.howToUse,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        status: product.outOfStock ? "OUT_OF_STOCK" : "ACTIVE",
        featured: product.featured ?? false,
        isNew: product.isNew ?? false,
        isBestSeller: product.isBestSeller ?? false,
        brandId,
        categoryId,
        images: { create: placeholderImages(slug, 3).map((img) => ({ ...img, alt: product.name })) },
      },
    });

    productIdByName.set(product.name, record.id);
  }

  console.log(`Seeded ${productIdByName.size} products.`);
  return productIdByName;
}

async function seedOffers(
  categoryIdByName: Map<string, string>,
  brandIdByName: Map<string, string>,
  productIdByName: Map<string, string>
) {
  for (const offer of OFFERS) {
    const existing = await db.offer.findFirst({ where: { title: offer.title } });
    if (existing) continue;

    await db.offer.create({
      data: {
        title: offer.title,
        description: offer.description,
        type: offer.type,
        value: offer.value,
        startDate: offer.startDate,
        endDate: offer.endDate,
        isActive: offer.isActive,
        brandId: offer.brand ? brandIdByName.get(offer.brand) : undefined,
        categoryId: offer.category ? categoryIdByName.get(offer.category) : undefined,
        products: offer.products
          ? { connect: offer.products.map((name) => ({ id: productIdByName.get(name) })) }
          : undefined,
      },
    });
  }

  console.log(`Seeded ${OFFERS.length} offers.`);
}

async function main() {
  await seedAdmin();
  const categoryIdByName = await seedCategories();
  const brandIdByName = await seedBrands();
  const productIdByName = await seedProducts(categoryIdByName, brandIdByName);
  await seedOffers(categoryIdByName, brandIdByName, productIdByName);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
