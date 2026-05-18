import type { ThemeName, SwatchName, SiteVariant } from '../themes/tokens'

export interface PhotoSlot { src: string; alt?: string; caption?: string }

export interface VaultPhotos {
  hero: PhotoSlot
  about: PhotoSlot
  storefront: PhotoSlot
  gallery: PhotoSlot[]
}

export interface Product {
  name: string
  price: string
  image: string
  imageAlt?: string
  blurb?: string
  badge?: string
  url?: string
}

export interface Category { name: string; image: string; imageAlt?: string; url?: string; count?: number }

export interface VaultSiteConfig {
  brand: string
  tagline: string
  blurb: string
  theme: ThemeName
  swatch: SwatchName
  variant: SiteVariant
  contact: { address: string; phone: string; email: string; mapEmbedUrl?: string }
  hours: Array<{ day: string; open: string }>
  photos: VaultPhotos
  story: { title: string; paragraphs: string[]; facts?: Array<{ label: string; value: string }> }
  featured: Product[]
  categories: Category[]
  testimonials: Array<{ quote: string; author: string; source?: string }>
  shopUrl: string
  social: Array<{ label: string; href: string }>
}

export const siteConfig: VaultSiteConfig = {
  brand: 'Vault Goods',
  tagline: 'Trinidad provisions',
  blurb: 'Hand-picked apparel, home goods, and gifts from makers across the Southwest.',
  theme: 'vibrant',
  swatch: 'fiesta',
  variant: 'essentials',
  contact: {
    address: '305 Main St, Trinidad, CO 81082',
    phone: '(719) 555-0125',
    email: 'shop@vaultgoods.com',
    mapEmbedUrl: 'https://www.google.com/maps?q=Trinidad,CO&output=embed',
  },
  shopUrl: 'https://example.com/shop',
  hours: [
    { day: 'Monday', open: 'Closed' },
    { day: 'Tue – Fri', open: '10:00 – 6:00' },
    { day: 'Saturday', open: '10:00 – 7:00' },
    { day: 'Sunday', open: '11:00 – 4:00' },
  ],
  photos: {
    hero: { src: '/photos/hero.jpg', alt: 'Hero product flat lay' },
    about: { src: '/photos/about-shop.jpg', alt: 'Inside the shop' },
    storefront: { src: '/photos/storefront.jpg', alt: 'Storefront on Main' },
    gallery: [
      { src: '/photos/product-01.jpg', alt: 'Ceramic mug' },
      { src: '/photos/product-02.jpg', alt: 'Wool throw' },
      { src: '/photos/product-03.jpg', alt: 'Leather wallet' },
      { src: '/photos/interior-01.jpg', alt: 'Shelving' },
      { src: '/photos/interior-02.jpg', alt: 'Counter' },
      { src: '/photos/lifestyle-01.jpg', alt: 'Goods in use' },
    ],
  },
  story: {
    title: 'A general store for the new Trinidad.',
    paragraphs: [
      'Vault is a tightly-edited shop for the things you will use every day — well-made apparel, home goods, books, and gifts.',
      'We carry over 40 makers from Colorado, New Mexico, and the wider Southwest, with new arrivals every Friday.',
    ],
    facts: [
      { label: 'Makers', value: '40+' },
      { label: 'Founded', value: '2025' },
      { label: 'Restock', value: 'Weekly' },
    ],
  },
  featured: [
    { name: 'Sangre de Cristo Mug', price: '$28', image: '/photos/product-01.jpg', blurb: 'Hand-thrown stoneware', badge: 'New', url: '#' },
    { name: 'Wool camp throw', price: '$145', image: '/photos/product-02.jpg', blurb: 'Made in Pueblo', url: '#' },
    { name: 'Leather card wallet', price: '$62', image: '/photos/product-03.jpg', blurb: 'Vegetable-tanned', url: '#' },
    { name: 'Field notebook', price: '$18', image: '/photos/product-04.jpg', blurb: 'Letterpress cover', badge: 'Local', url: '#' },
  ],
  categories: [
    { name: 'Apparel', image: '/photos/cat-apparel.jpg', count: 32, url: '#' },
    { name: 'Home', image: '/photos/cat-home.jpg', count: 41, url: '#' },
    { name: 'Pantry', image: '/photos/cat-pantry.jpg', count: 18, url: '#' },
    { name: 'Gifts', image: '/photos/cat-gifts.jpg', count: 27, url: '#' },
  ],
  testimonials: [
    { quote: 'Stopped in for a card and walked out with a sweater. Worth the trip.', author: 'Liz O.', source: 'Google' },
    { quote: 'Best gift shopping in the county. Real things by real people.', author: 'Tomás G.', source: 'Yelp' },
    { quote: 'Their newsletter is the only marketing email I open.', author: 'Robin H.', source: 'Instagram' },
  ],
  social: [
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'TikTok', href: 'https://tiktok.com' },
  ],
}
