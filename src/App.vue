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
        <template v-for="item in menuItems" :key="item.title">

          <v-menu v-if="item.children" offset-y>
            <template v-slot:activator="{ props }">
              <v-btn text v-bind="props">
                <v-icon start>{{ item.icon }}</v-icon>
                {{ item.title }}
                <v-icon end>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
              >
                <v-list-item-title>{{ child.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn v-else :to="item.to" text>
            <v-icon start>{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-btn>
        </template>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="right" app>
      <v-list>
        <template v-for="item in menuItems" :key="item.to || item.title">

          <v-list-item
            v-if="!item.children"
            :to="item.to"
            @click="drawer = false"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>


          <div v-else>

            <v-list-item @click="toggleDirectories">
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>


            <div v-if="directoriesOpen" class="submenu">
              <v-list-item
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                @click="drawer = false"
                class="submenu-item"
              >
                <v-list-item-title>{{ child.title }}</v-list-item-title>
              </v-list-item>
            </div>
          </div>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="page-container">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'

  const drawer = ref(false);
  const directoriesOpen = ref(false);

  const toggleDirectories = () => {
    directoriesOpen.value = !directoriesOpen.value
  }

  const menuItems = [
    { title: 'Рейсы', to: '/trips', icon: 'mdi-bus' },
    { title: 'Автобусы', to: '/buses', icon: 'mdi-bus-side' },
    { title: 'Водители', to: '/drivers', icon: 'mdi-account' },
    {
      title: 'Справочники',
      icon: 'mdi-book-open-variant',
      children: [
        { title: 'Станции', to: '/stations', icon: 'mdi-domain' },
        { title: 'Марки автобусов', to: '/bus-models', icon: 'mdi-car' }
      ]
    },
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

  .submenu {

    @include tablet {
      padding-left: var(--spacing-6);
    }


    .submenu-item {
      @include tablet {
        min-height: to-rem(40);
        font-size: 0.9rem;
      }

      .v-list-item-title {
        @include tablet {
          font-weight: normal;
        }
      }
    }
  }

</style>
