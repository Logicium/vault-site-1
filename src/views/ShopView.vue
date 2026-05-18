<script setup lang="ts">
import { siteConfig } from '../config/site.config'
import HeroSection from '../components/sections/HeroSection.vue'
import CategoriesSection from '../components/sections/CategoriesSection.vue'
import ProductsSection from '../components/sections/ProductsSection.vue'
</script>

<template>
  <HeroSection
    subpage
    eyebrow="Shop"
    title="Everything in the shop"
    subtitle="New arrivals every Friday. Local pickup is free in Trinidad."
    :image="siteConfig.photos.hero.src"
    :image-alt="siteConfig.photos.hero.alt"
  />
  <CategoriesSection :categories="siteConfig.categories" />
  <ProductsSection title="Featured" :products="siteConfig.featured" :shop-all-url="siteConfig.shopUrl" />
</template>
