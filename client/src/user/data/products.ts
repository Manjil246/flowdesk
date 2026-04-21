export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  price: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category: string;
  basePrice: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  badge?: 'new' | 'trending';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
}

export const categories: Category[] = [
  { id: 'cat-1', name: 'Women', slug: 'women', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop&q=80', itemCount: 186 },
  { id: 'cat-2', name: 'Men', slug: 'men', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&q=80', itemCount: 124 },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=1000&fit=crop&q=80', itemCount: 88 },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const oneSize = ['One Size'];
const freeSz = ['Free Size'];

function makeVariants(productId: string, colors: {name: string, hex: string}[], szList: string[], price: number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const color of colors) {
    for (const size of szList) {
      variants.push({
        id: `${productId}-${color.name}-${size}`.replace(/\s/g, '-').toLowerCase(),
        size,
        color: color.name,
        colorHex: color.hex,
        stock: Math.floor(Math.random() * 20) + 2,
        price,
        sku: `SS-${productId.slice(-3).toUpperCase()}-${color.name.slice(0, 2).toUpperCase()}-${size}`,
      });
    }
  }
  return variants;
}

export const products: Product[] = [
  {
    id: 'prod-01', name: 'Silk Anarkali Kurta Set', slug: 'silk-anarkali-kurta-set',
    description: 'A stunning silk Anarkali kurta set that flows gracefully with every step. Intricate hand-embroidered motifs along the neckline and hemline. Comes with matching dupatta and palazzo pants. Perfect for festive occasions and celebrations.',
    categoryId: 'cat-1', category: 'Women', basePrice: 4200,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&q=80'],
    tags: ['kurta', 'festive'], isActive: true, isFeatured: true,
    variants: makeVariants('prod-01', [{name:'Rose Blush',hex:'#E8B4B8'},{name:'Midnight Blue',hex:'#191970'},{name:'Forest Green',hex:'#228B22'},{name:'Ivory',hex:'#FFFFF0'}], sizes, 4200),
    rating: 4.8, reviewCount: 24, badge: 'new',
  },
  {
    id: 'prod-02', name: 'Pashmina Wrap Saree', slug: 'pashmina-wrap-saree',
    description: 'Luxurious hand-woven Pashmina saree from the highlands of Nepal. Incredibly soft and lightweight with a subtle natural sheen. Each piece takes artisans over 40 hours to complete.',
    categoryId: 'cat-1', category: 'Women', basePrice: 8900,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&q=80'],
    tags: ['saree', 'pashmina', 'luxury'], isActive: true, isFeatured: true,
    variants: makeVariants('prod-02', [{name:'Royal Purple',hex:'#7851A9'},{name:'Ivory',hex:'#FFFFF0'},{name:'Deep Red',hex:'#8B0000'}], freeSz, 8900),
    rating: 4.9, reviewCount: 18, badge: 'trending',
  },
  {
    id: 'prod-03', name: 'Silk Embroidered Lehenga', slug: 'silk-embroidered-lehenga',
    description: 'A breathtaking embroidered silk lehenga featuring intricate zardozi work. The perfect statement piece for weddings and grand celebrations.',
    categoryId: 'cat-1', category: 'Women', basePrice: 14500,
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&q=80'],
    tags: ['lehenga', 'bridal', 'festive'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-03', [{name:'Bridal Red',hex:'#C41E3A'},{name:'Royal Blue',hex:'#4169E1'},{name:'Emerald',hex:'#50C878'}], ['XS','S','M','L','XL'], 14500),
    rating: 4.7, reviewCount: 12,
  },
  {
    id: 'prod-04', name: 'Cotton Floral Midi Dress', slug: 'cotton-floral-midi-dress',
    description: 'A breezy cotton midi dress in a cheerful floral print. Features a flattering A-line silhouette with tie-waist detail. Perfect for brunches and casual outings.',
    categoryId: 'cat-1', category: 'Women', basePrice: 2800,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop&q=80'],
    tags: ['dress', 'casual', 'western'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-04', [{name:'Floral Print',hex:'#DDA0DD'},{name:'Sage',hex:'#BCB88A'},{name:'Dusty Rose',hex:'#DCAE96'}], sizes, 2800),
    rating: 4.5, reviewCount: 31, badge: 'new',
  },
  {
    id: 'prod-05', name: 'Dhaka Print Palazzo Kurta Set', slug: 'dhaka-print-palazzo-kurta-set',
    description: 'Traditional Nepali Dhaka print reimagined in a modern palazzo kurta set. The vibrant hand-woven fabric celebrates Nepal\'s textile heritage.',
    categoryId: 'cat-1', category: 'Women', basePrice: 3400,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&q=80'],
    tags: ['dhaka', 'casual'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-05', [{name:'Red Dhaka',hex:'#B22222'},{name:'Blue Dhaka',hex:'#4682B4'},{name:'Black Dhaka',hex:'#2C2C2C'}], ['S','M','L','XL','XXL'], 3400),
    rating: 4.6, reviewCount: 15,
  },
  {
    id: 'prod-06', name: 'Silk Blouse with Pintucks', slug: 'silk-blouse-with-pintucks',
    description: 'An elegant silk blouse with delicate pintuck detailing. Versatile enough for both office and evening wear. Pairs beautifully with our palazzo pants or a saree.',
    categoryId: 'cat-1', category: 'Women', basePrice: 2100,
    images: ['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop&q=80'],
    tags: ['top', 'blouse', 'elegant'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-06', [{name:'Ivory',hex:'#FFFFF0'},{name:'Sage Green',hex:'#8FBC8F'},{name:'Dusty Pink',hex:'#D4A0A0'}], ['XS','S','M','L','XL'], 2100),
    rating: 4.4, reviewCount: 22,
  },
  {
    id: 'prod-07', name: 'Embroidered Cotton Kurta Set', slug: 'embroidered-cotton-kurta-set',
    description: 'A comfortable cotton kurta set with beautiful thread embroidery. Perfect for everyday wear with a touch of elegance. Comes with matching pants.',
    categoryId: 'cat-1', category: 'Women', basePrice: 3200,
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&q=80'],
    tags: ['kurta', 'cotton', 'daily'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-07', [{name:'Sky Blue',hex:'#87CEEB'},{name:'Peach',hex:'#FFDAB9'},{name:'Mustard',hex:'#E1AD01'}], sizes, 3200),
    rating: 4.3, reviewCount: 28,
  },
  {
    id: 'prod-08', name: 'Statement Jhumka Earrings', slug: 'statement-jhumka-earrings',
    description: 'Handcrafted jhumka earrings with intricate filigree work. A timeless accessory that adds a touch of traditional elegance to any outfit.',
    categoryId: 'cat-3', category: 'Accessories', basePrice: 850,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=800&fit=crop&q=80'],
    tags: ['earrings', 'jewelry', 'traditional'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-08', [{name:'Gold',hex:'#FFD700'},{name:'Silver',hex:'#C0C0C0'},{name:'Rose Gold',hex:'#B76E79'}], oneSize, 850),
    rating: 4.7, reviewCount: 45, badge: 'trending',
  },
  {
    id: 'prod-09', name: 'Handwoven Dhaka Tote Bag', slug: 'handwoven-dhaka-tote-bag',
    description: 'A spacious tote bag crafted from authentic Nepali Dhaka fabric. Features a reinforced leather base and cotton-lined interior with zip pocket.',
    categoryId: 'cat-3', category: 'Accessories', basePrice: 1800,
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop&q=80'],
    tags: ['bag', 'dhaka', 'handmade'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-09', [{name:'Red',hex:'#B22222'},{name:'Blue',hex:'#4682B4'},{name:'Multicolor',hex:'#FF6347'}], oneSize, 1800),
    rating: 4.5, reviewCount: 19,
  },
  {
    id: 'prod-10', name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag',
    description: 'Premium full-grain leather crossbody bag with adjustable strap. Minimalist design with multiple compartments for everyday essentials.',
    categoryId: 'cat-3', category: 'Accessories', basePrice: 3500,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80'],
    tags: ['bag', 'leather', 'everyday'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-10', [{name:'Tan',hex:'#D2B48C'},{name:'Black',hex:'#111111'},{name:'Maroon',hex:'#800000'}], oneSize, 3500),
    rating: 4.6, reviewCount: 33, badge: 'new',
  },
  {
    id: 'prod-11', name: 'Silk Pashmina Shawl', slug: 'silk-pashmina-shawl',
    description: 'Luxuriously soft silk-blend pashmina shawl hand-woven in the Himalayan foothills. A versatile accessory for both warmth and style, making it the perfect gift.',
    categoryId: 'cat-3', category: 'Accessories', basePrice: 5500,
    images: ['https://images.unsplash.com/photo-1601244005535-a48ba69ec25c?w=600&h=800&fit=crop&q=80'],
    tags: ['shawl', 'pashmina', 'gift'], isActive: true, isFeatured: true,
    variants: makeVariants('prod-11', [{name:'Natural Cream',hex:'#FFFDD0'},{name:'Charcoal',hex:'#36454F'},{name:'Burgundy',hex:'#722F37'}], oneSize, 5500),
    rating: 4.9, reviewCount: 42, badge: 'trending',
  },
  {
    id: 'prod-12', name: "Men's Wool Blend Blazer", slug: 'mens-wool-blend-blazer',
    description: 'A sophisticated wool-blend blazer with a tailored slim fit. Features notch lapels, double-button closure, and interior pockets. Perfect for formal events and business meetings.',
    categoryId: 'cat-2', category: 'Men', basePrice: 8500,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=80'],
    tags: ['blazer', 'formal', 'men'], isActive: true, isFeatured: true,
    variants: makeVariants('prod-12', [{name:'Charcoal Grey',hex:'#36454F'},{name:'Navy',hex:'#000080'},{name:'Camel',hex:'#C19A6B'}], ['S','M','L','XL','XXL'], 8500),
    rating: 4.7, reviewCount: 27,
  },
  {
    id: 'prod-13', name: "Men's Dhaka Print Shirt", slug: 'mens-dhaka-print-shirt',
    description: 'A modern shirt featuring authentic Dhaka print fabric from Terhathum. Slim fit with a mandarin collar for a contemporary Nepali aesthetic.',
    categoryId: 'cat-2', category: 'Men', basePrice: 1800,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop&q=80'],
    tags: ['shirt', 'dhaka', 'men'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-13', [{name:'Classic Red',hex:'#B22222'},{name:'Navy Blue',hex:'#000080'},{name:'Black',hex:'#111111'}], ['S','M','L','XL','XXL'], 1800),
    rating: 4.4, reviewCount: 16,
  },
  {
    id: 'prod-14', name: "Men's Ethnic Kurta", slug: 'mens-ethnic-kurta',
    description: 'A refined cotton-silk blend kurta for men. Features subtle tone-on-tone embroidery and a comfortable regular fit. Ideal for festivals and celebrations.',
    categoryId: 'cat-2', category: 'Men', basePrice: 2200,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop&q=80'],
    tags: ['kurta', 'festive', 'men'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-14', [{name:'Ivory',hex:'#FFFFF0'},{name:'Slate Grey',hex:'#708090'},{name:'Deep Blue',hex:'#00008B'}], ['S','M','L','XL','XXL'], 2200),
    rating: 4.5, reviewCount: 21, badge: 'new',
  },
  {
    id: 'prod-15', name: "Men's Slim Chino Pants", slug: 'mens-slim-chino-pants',
    description: 'Premium stretch-cotton chino pants with a slim tapered fit. Features a comfortable mid-rise waist and clean front design.',
    categoryId: 'cat-2', category: 'Men', basePrice: 2600,
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop&q=80'],
    tags: ['pants', 'casual', 'everyday', 'men'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-15', [{name:'Khaki',hex:'#C3B091'},{name:'Navy',hex:'#000080'},{name:'Olive',hex:'#556B2F'}], ['28','30','32','34','36','38'], 2600),
    rating: 4.3, reviewCount: 38,
  },
  {
    id: 'prod-16', name: "Men's Cotton Waistcoat", slug: 'mens-cotton-waistcoat',
    description: 'A versatile cotton waistcoat with a structured fit. Features decorative buttons and welt pockets. Layer it over a kurta or a crisp shirt.',
    categoryId: 'cat-2', category: 'Men', basePrice: 1900,
    images: ['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&h=800&fit=crop&q=80'],
    tags: ['waistcoat', 'festive', 'men'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-16', [{name:'Maroon',hex:'#800000'},{name:'Black',hex:'#111111'},{name:'Forest Green',hex:'#228B22'}], ['S','M','L','XL','XXL'], 1900),
    rating: 4.2, reviewCount: 14,
  },
  {
    id: 'prod-17', name: 'Traditional Dhaka Cap', slug: 'traditional-dhaka-cap',
    description: 'An iconic Nepali Dhaka topi handcrafted from authentic Dhaka fabric. A symbol of national pride, perfect for cultural celebrations and everyday wear.',
    categoryId: 'cat-3', category: 'Accessories', basePrice: 650,
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=800&fit=crop&q=80'],
    tags: ['cap', 'dhaka', 'traditional', 'men'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-17', [{name:'Classic Red',hex:'#B22222'},{name:'Black',hex:'#111111'},{name:'Blue',hex:'#4682B4'}], ['S','M','L'], 650),
    rating: 4.6, reviewCount: 52,
  },
  {
    id: 'prod-18', name: 'Handcrafted Clutch with Embroidery', slug: 'handcrafted-clutch-with-embroidery',
    description: 'A stunning handcrafted clutch featuring intricate embroidery inspired by Nepali textile traditions. Features a magnetic snap closure and removable chain strap.',
    categoryId: 'cat-3', category: 'Accessories', basePrice: 2100,
    images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=800&fit=crop&q=80'],
    tags: ['clutch', 'embroidered', 'festive'], isActive: true, isFeatured: false,
    variants: makeVariants('prod-18', [{name:'Royal Blue',hex:'#4169E1'},{name:'Maroon',hex:'#800000'},{name:'Gold',hex:'#FFD700'}], oneSize, 2100),
    rating: 4.4, reviewCount: 17, badge: 'new',
  },
];

export const coupons = [
  { code: 'STYLE10', discountType: 'percentage' as const, discountValue: 10, minOrderValue: 0 },
  { code: 'NEPAL20', discountType: 'percentage' as const, discountValue: 20, minOrderValue: 5000 },
  { code: 'FIRST15', discountType: 'percentage' as const, discountValue: 15, minOrderValue: 0 },
];


