<script setup lang="ts">
import { computed } from 'vue'
import { siteConfig } from '../config/site.config'
import { VARIANT_PHOTO_COUNT, variantAtLeast } from '@apotome/archetype-shared/themes/tokens'
import { useSiteContentStore } from '@apotome/archetype-shared/platform/siteContentStore'
import HeroSection from '@apotome/archetype-shared/components/sections/HeroSection.vue'
import AboutSection from '@apotome/archetype-shared/components/sections/AboutSection.vue'
import CategoriesSection from '../components/sections/CategoriesSection.vue'
import ProductsSection from '../components/sections/ProductsSection.vue'
import GallerySection from '@apotome/archetype-shared/components/sections/GallerySection.vue'
import HoursSection from '@apotome/archetype-shared/components/sections/HoursSection.vue'
import TestimonialsSection from '@apotome/archetype-shared/components/sections/TestimonialsSection.vue'

const galleryLimit = computed(() => VARIANT_PHOTO_COUNT[siteConfig.variant].gallery)
const isPortfolio = computed(() => variantAtLeast(siteConfig.variant, 'portfolio'))
const content = useSiteContentStore()
const reviewItems = computed(() =>
  content.reviewsSource === 'google' && content.googleReviews.length
    ? content.googleReviews
    : siteConfig.testimonials,
)
</script>

<template>
  <HeroSection
    :eyebrow="siteConfig.tagline"
    :title="siteConfig.brand"
    :subtitle="siteConfig.blurb"
    :image="siteConfig.photos.hero.src"
    :image-alt="siteConfig.photos.hero.alt"
    :cta-primary="{ label: 'Shop now', to: '/shop' }"
    :cta-secondary="{ label: 'Visit us', to: '/visit' }"
    :layout="isPortfolio ? 'stage' : 'split'"
  />
  <CategoriesSection
    eyebrow="Browse"
    :categories="siteConfig.categories"
  />
  <ProductsSection
    eyebrow="Just in"
    title="A few favorites"
    :products="siteConfig.featured.slice(0, isPortfolio ? 4 : 3)"
    :shop-all-url="siteConfig.shopUrl"
  />
  <AboutSection
    eyebrow="Our shop"
    :title="siteConfig.story.title"
    :paragraphs="siteConfig.story.paragraphs"
    :facts="siteConfig.story.facts"
    :image="siteConfig.photos.about.src"
    :image-alt="siteConfig.photos.about.alt"
    reverse
  />
  <GallerySection
    eyebrow="In the wild"
    :photos="siteConfig.photos.gallery"
    :limit="galleryLimit"
    :layout="isPortfolio ? 'masonry' : 'grid'"
  />
  <HoursSection
    eyebrow="Visit"
    title="When we’re open"
    :hours="siteConfig.hours"
  />
  <TestimonialsSection
    eyebrow="Notes from neighbors"
    :items="reviewItems"
  />
</template>
