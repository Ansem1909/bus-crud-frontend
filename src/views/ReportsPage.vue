<template>
  <div class="reports-page">
    <v-card class="reports-page__card" elevation="2">
      <v-card-title>Отчёт по водителю</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedDriverId"
              :items="drivers"
              item-value="id"
              item-title="fullName"
              label="Выберите водителя"
              clearable
              :rules="[v => !!v || 'Выберите водителя']"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dateFrom"
              type="date"
              label="Дата с"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dateTo"
              type="date"
              label="Дата по"
              clearable
            />
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-btn color="primary" @click="generateReport">Сформировать</v-btn>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="reportData !== null" class="reports-page__result" elevation="2">
      <v-card-title>Результат</v-card-title>
      <v-card-text>
        <div class="report-stats">
          <div class="stat-item">
            <div class="stat-label">Выполнено рейсов:</div>
            <div class="stat-value">{{ reportData.totalTrips }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Отработано часов:</div>
            <div class="stat-value">{{ reportData.totalHours }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Закрыть</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useDriverStore } from '../stores/useDriverStore'
  import { useTripStore } from '../stores/useTripStore'

  const driverStore = useDriverStore()
  const tripStore = useTripStore()

  const selectedDriverId = ref(null)
  const dateFrom = ref('')
  const dateTo = ref('')
  const reportData = ref(null)
  const snackbar = ref({ show: false, text: '', color: 'error' })

  const drivers = computed(() => driverStore.drivers)

  const generateReport = () => {
    if (!selectedDriverId.value) {
      snackbar.value = { show: true, text: 'Выберите водителя', color: 'error' }
      return
    }
    if (!dateFrom.value || !dateTo.value) {
      snackbar.value = { show: true, text: 'Укажите период (дата с и по)', color: 'error' }
      return
    }

    const from = new Date(dateFrom.value)
    const to = new Date(dateTo.value)
    to.setHours(23, 59, 59, 999)

    const filteredTrips = tripStore.trips.filter(trip => {
      const tripDate = new Date(trip.departureDate)
      return trip.driverId === selectedDriverId.value && tripDate >= from && tripDate <= to
    })

    let totalTrips = filteredTrips.length
    let totalHours = 0

    filteredTrips.forEach(trip => {
      const dep = new Date(`${trip.departureDate}T${trip.departureTime}`)
      const arr = new Date(`${trip.arrivalDate}T${trip.arrivalTime}`)
      const hours = (arr - dep) / (1000 * 60 * 60)
      totalHours += hours
    })

    reportData.value = {
      totalTrips,
      totalHours: totalHours.toFixed(1)
    }
  }
</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .reports-page {
    &__card, &__result {
      margin-bottom: var(--spacing-6);
      padding: var(--spacing-5);
    }

    &__result {
      margin-top: var(--spacing-4);
    }
    .report-stats {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      .stat-item {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-gray200);
        padding-bottom: var(--spacing-2);
        .stat-label {
          font-weight: 500;
        }
        .stat-value {
          font-weight: 700;
          color: var(--color-primary);
        }
      }
    }
  }
</style>
