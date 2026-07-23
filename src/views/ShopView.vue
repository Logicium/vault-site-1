<script setup lang="ts">
import { computed } from 'vue'
import { siteConfig } from '../config/site.config'
import HeroSection from '@apotome/archetype-shared/components/sections/HeroSection.vue'
import ShopSection from '@apotome/archetype-shared/components/sections/ShopSection.vue'
import CategoriesSection from '../components/sections/CategoriesSection.vue'
import ProductsSection from '../components/sections/ProductsSection.vue'
import { useSiteContentStore } from '@apotome/archetype-shared/platform/siteContentStore'

const store = useSiteContentStore()
const showShop = computed(() => store.hasAddOn('eshop'))
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

  <ShopSection
    v-if="showShop"
    eyebrow="Shop"
    title="Available now"
    intro="Add to cart, then check out for pickup or shipping."
  />

  <template v-else>
    <CategoriesSection :categories="siteConfig.categories" />
    <ProductsSection title="Featured" :products="siteConfig.featured" :shop-all-url="siteConfig.shopUrl" />
  </template>
</template>
