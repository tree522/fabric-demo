import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/demo1',
      name: 'demo1',
      component: () => import('../views/fabric/demo1View.vue')
    },
    {
      path: '/demo2',
      name: 'demo2',
      component: () => import('../views/fabric/demo2View.vue')
    },
    {
      path: '/demo3',
      name: 'demo3',
      component: () => import('../views/fabric/demo3View.vue')
    },
    {
      path: '/demo4',
      name: 'demo4',
      component: () => import('../views/fabric/demo4View.vue')
    }
  ]
})

export default router
