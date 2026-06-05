import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/trips' },
    { path: '/trips', name: 'Trips', component: () => import('../views/TripsPage.vue') },
    { path: '/buses', name: 'Buses', component: () => import('../views/BusesPage.vue') },
    { path: '/drivers', name: 'Drivers', component: () => import('../views/DriversPage.vue') },
    { path: '/directories', name: 'Directories', component: () => import('../views/DirectoriesPage.vue') },
    { path: '/reports', name: 'Reports', component: () => import('../views/ReportsPage.vue') },
  ],
})

export default router
