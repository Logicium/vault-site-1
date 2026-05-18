<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { siteConfig } from './config/site.config'
import { useSiteTheme } from './composables/useSiteTheme'
import { useImagePreload } from './composables/useImagePreload'
import { useApScrollbar } from './composables/useApScrollbar'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AppLoader from './components/AppLoader.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'

const { init } = useSiteTheme()
const { isReady, preloadCritical } = useImagePreload()

onMounted(async () => {
  init(siteConfig.theme, siteConfig.swatch, siteConfig.variant, 'shop')
  useApScrollbar()
  await preloadCritical([
    siteConfig.photos.hero.src,
    siteConfig.photos.about.src,
    ...siteConfig.featured.map(p => p.image),
    ...siteConfig.categories.map(c => c.image),
    ...siteConfig.photos.gallery.map(p => p.src),
  ])
})

const showSwitcher = computed(() => import.meta.env.DEV)

const navLinks = computed(() => {
  const base = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/visit', label: 'Visit' },
  ]
  if (siteConfig.variant === 'portfolio') {
    base.splice(2, 0, { to: '/gallery', label: 'Lookbook' })
  }
  return base
})
</script>

<template>
  <AppLoader :brand="siteConfig.brand" :visible="!isReady" />
  <AppHeader
    :brand="siteConfig.brand"
    :tagline="siteConfig.tagline"
    :links="navLinks"
    cta-label="Shop"
    cta-to="/shop"
  />
  <main><RouterView /></main>
  <AppFooter
    :brand="siteConfig.brand"
    :blurb="siteConfig.blurb"
    :address="siteConfig.contact.address"
    :phone="siteConfig.contact.phone"
    :email="siteConfig.contact.email"
    :links="navLinks"
    :social="siteConfig.social"
  />
  <ThemeSwitcher v-if="showSwitcher" />
</template>
