import { createRouter, createWebHistory } from 'vue-router'
import routes from 'src/router/routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
