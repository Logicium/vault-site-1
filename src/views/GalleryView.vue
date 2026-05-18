<script setup lang="ts">
import { siteConfig } from '../config/site.config'
import HeroSection from '../components/sections/HeroSection.vue'
import GallerySection from '../components/sections/GallerySection.vue'
</script>

<template>
  <HeroSection
    subpage
    eyebrow="Lookbook"
    title="Goods in their habitat"
    :image="siteConfig.photos.about.src"
    :image-alt="siteConfig.photos.about.alt"
  />
  <GallerySection :photos="siteConfig.photos.gallery" layout="masonry" />
</template>
