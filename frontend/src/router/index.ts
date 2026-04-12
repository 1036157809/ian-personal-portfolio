import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Projects from '../views/Projects.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'
import TongdaoDemo from '../views/TongdaoDemo.vue'
import ShougangPermissionDemo from '../views/ShougangPermissionDemo.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact
    },
    {
      path: '/tongdao-demo',
      name: 'tongdao-demo',
      component: TongdaoDemo
    },
    {
      path: '/shougang-permission-demo',
      name: 'shougang-permission-demo',
      component: ShougangPermissionDemo
    }
  ]
})

export default router
