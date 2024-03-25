import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/home.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router;