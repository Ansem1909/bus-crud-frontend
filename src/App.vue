<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Управление автобусными рейсами</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        text
      >
        <v-icon start>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const menuItems = [
  { title: 'Рейсы', to: '/trips', icon: 'mdi-bus' },
  { title: 'Автобусы', to: '/buses', icon: 'mdi-bus-side' },
  { title: 'Водители', to: '/drivers', icon: 'mdi-account' },
  { title: 'Справочники', to: '/directories', icon: 'mdi-book-open-variant' },
  { title: 'Отчёты', to: '/reports', icon: 'mdi-chart-bar' },
]
</script>

<style scoped>
.v-btn {
  margin: 0 4px;
}
</style>
