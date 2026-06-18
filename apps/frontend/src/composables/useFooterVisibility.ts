import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTES } from 'src/constants'

const HIDDEN_FOOTER_ROUTES = [
  ROUTES.DEMO_MUSIC_VIZ,
] as const

export function useFooterVisibility() {
  const route = useRoute()
  const isFooterVisible = computed(() => !HIDDEN_FOOTER_ROUTES.includes(route.path as any))
  return { isFooterVisible }
}
