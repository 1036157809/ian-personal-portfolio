import { createRouter, createWebHistory } from 'vue-router'
import routes, { scrollBehavior } from 'src/router/routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior
})

export default router
