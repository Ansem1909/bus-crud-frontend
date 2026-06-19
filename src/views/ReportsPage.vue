<template>
  <div class="reports-page">
    <v-card class="reports-page__card" elevation="2">
      <v-card-title>Отчёт по водителю</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedDriverId"
              :items="driverStore.drivers"
              item-value="id"
              :item-title="driver => `${driver.lastName} ${driver.firstName} ${driver.patronymic}`.trim()"
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
  import { ref } from 'vue'
  import { useDriverStore } from '../stores/useDriverStore'
  import { useTripStore } from '../stores/useTripStore'
  import dayjs from 'dayjs'

  const driverStore = useDriverStore()
  const tripStore = useTripStore()

  const selectedDriverId = ref(null)
  const dateFrom = ref('')
  const dateTo = ref('')
  const reportData = ref(null)
  const snackbar = ref({ show: false, text: '', color: 'error' })
  const generateReport = () => {
    if (!selectedDriverId.value) {
      snackbar.value = { show: true, text: 'Выберите водителя', color: 'error' }
      return
    }
    if (!dateFrom.value || !dateTo.value) {
      snackbar.value = { show: true, text: 'Укажите период (дата с и по)', color: 'error' }
      return
    }

    const from = dayjs(dateFrom.value)
    const to = dayjs(dateTo.value).endOf('day')
    if (!from.isValid() || !to.isValid()) {
      snackbar.value = { show: true, text: 'Некорректный диапазон дат', color: 'error' }
      return
    }

    const filteredTrips = tripStore.trips.filter(trip => {
      const tripDate = dayjs(trip.departureDate)
      return trip.driverId === selectedDriverId.value && tripDate.isBetween(from, to, null, '[]')
    })

    let totalTrips = filteredTrips.length
    let totalMinutes = 0

    filteredTrips.forEach(trip => {
      const dep = dayjs(`${trip.departureDate}T${trip.departureTime}`)
      const arr = dayjs(`${trip.arrivalDate}T${trip.arrivalTime}`)
      const diffMinutes = arr.diff(dep, 'minute')
      totalMinutes += diffMinutes
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const formattedHours = hours > 0 ? `${hours} ч.` : ''
    const formattedMinutes = minutes > 0 ? `${minutes} мин.` : ''
    const totalHoursString = [formattedHours, formattedMinutes].filter(Boolean).join(' ') || '0 мин.'

    reportData.value = {
      totalTrips,
      totalHours: totalHoursString
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
