<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>BusRus</v-app-bar-title>
      <v-spacer></v-spacer>

      <v-app-bar-nav-icon
        @click.stop="drawer = !drawer"
        :icon="drawer ? 'mdi-close' : 'mdi-menu'"
        class="burger-icon"
      ></v-app-bar-nav-icon>

      <div class="desktop-buttons">
        <v-btn
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          text
        >
          <v-icon start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="right"
      app
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          @click="drawer = false"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="custom-container">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(false)

const menuItems = [
  { title: 'Рейсы', to: '/trips', icon: 'mdi-bus' },
  { title: 'Автобусы', to: '/buses', icon: 'mdi-bus-side' },
  { title: 'Водители', to: '/drivers', icon: 'mdi-account' },
  { title: 'Справочники', to: '/directories', icon: 'mdi-book-open-variant' },
  { title: 'Отчёты', to: '/reports', icon: 'mdi-chart-bar' },
]
</script>

<style lang="scss" scoped>
@use './assets/styles/helpers' as *;
@use './assets/styles/settings' as *;

.burger-icon {
  display: none;

  @include tablet {
    display: flex;
  }
}
.desktop-buttons {
  display: flex;
  gap: var(--spacing-2);

  @include tablet {
    display: none;
  }
}

</style>
