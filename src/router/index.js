import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/trips' },
    { path: '/trips', name: 'Trips', component: () => import('../views/TripsPage.vue') },
    { path: '/buses', name: 'Buses', component: () => import('../views/BusesPage.vue') },
    { path: '/drivers', name: 'Drivers', component: () => import('../views/DriversPage.vue') },
    { path: '/bus-models', name: 'Bus-Models', component: () => import('../views/BusModelPage.vue') },
    { path: '/stations', name: 'Stations', component: () => import('../views/StationPage.vue') },
    { path: '/reports', name: 'Reports', component: () => import('../views/ReportsPage.vue') },
  ],
})

export default router
