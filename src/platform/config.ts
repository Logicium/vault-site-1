/**
 * Platform feature switch.
 *
 * When `enabled` is true, the app:
 *   - boots `useSiteContentStore().hydrate()` from the backend overlay before mount,
 *   - registers `/admin/*` routes for the owner dashboard,
 *   - posts contact-form submissions to the backend.
 *
 * When false (default), the site behaves exactly as it does today: fully static,
 * reading from the build-time `src/config/site.config.ts`.
 *
 * Toggle via `VITE_PLATFORM_ENABLED=true` in the environment.
 */
export const PLATFORM_ENABLED = import.meta.env.VITE_PLATFORM_ENABLED === 'true'

/** Backend base URL (no trailing slash). */
export const PLATFORM_API = (import.meta.env.VITE_CONTENT_API || '').replace(/\/$/, '')

/** This site's slug in the backend. */
export const PLATFORM_SLUG = import.meta.env.VITE_SITE_SLUG || ''

/** Which archetype this UI represents. Used by the wizard / admin scaffolding. */
export const ARCHETYPE_KIND = 'vault' as 'mesa' | 'hearth' | 'vault' | 'project' |'keystone' |'keystone'

