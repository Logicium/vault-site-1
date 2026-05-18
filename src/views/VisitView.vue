<script setup lang="ts">
import { siteConfig } from '../config/site.config'
import HeroSection from '../components/sections/HeroSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'
import HoursSection from '../components/sections/HoursSection.vue'
</script>

<template>
  <HeroSection
    subpage
    eyebrow="Visit"
    title="Stop in"
    subtitle="Right on Main Street, two doors down from the post office. Free street parking."
    :image="siteConfig.photos.hero.src"
    :image-alt="siteConfig.photos.hero.alt"
  />
  <HoursSection :hours="siteConfig.hours" />
  <ContactSection
    title="Send us a note"
    :address="siteConfig.contact.address"
    :phone="siteConfig.contact.phone"
    :email="siteConfig.contact.email"
    :map-embed-url="siteConfig.contact.mapEmbedUrl"
  />
</template>
