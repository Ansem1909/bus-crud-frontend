<template>
  <div class="trips-page">
    <div class="trips-page__header">
      <div class="trips-page__filter">
        <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-bind="props"
              label="Дата рейсов"
              :model-value="formattedSelectedDate"
              prepend-inner-icon="mdi-calendar"
              readonly
              hide-details
              clearable
              @click:clear="clearDate"
            />
          </template>
          <v-date-picker
            :model-value="selectedDate ? new Date(selectedDate) : null"
            @update:model-value="onDateSelect"
            :min="minDate ? new Date(minDate) : undefined"
            :max="maxDate ? new Date(maxDate) : undefined"
            :first-day-of-week="1"
            locale="ru"
          />
        </v-menu>
      </div>
      <div class="trips-page__add-btn">
        <v-btn
          class="trips-page__btn"
          color="primary"
          @click="openAddDialog"
        >
          <v-icon left>mdi-plus</v-icon>
          Добавить рейс
        </v-btn>
      </div>
    </div>

    <div v-if="filteredTrips.length" class="trips-page__list">
      <v-card
        v-for="trip in filteredTrips"
        :key="trip.id"
        class="trips-page__card"
        elevation="2"
      >
        <div class="trips-page__route">
          <span class="trips-page__city">{{ getStationName(trip.departureStationId) }}</span>
          <v-icon class="trips-page__arrow" size="small">mdi-arrow-right</v-icon>
          <span class="trips-page__city">{{ getStationName(trip.arrivalStationId) }}</span>
        </div>

        <div class="trips-page__times">
          <div class="trips-page__time-block trips-page__time-block--departure">
            <span class="trips-page__time">{{ trip.departureTime }}</span>
            <span class="trips-page__date">{{ trip.departureDate }}</span>
          </div>
          <div class="trips-page__time-block trips-page__time-block--arrival">
            <span class="trips-page__time">{{ trip.arrivalTime }}</span>
            <span class="trips-page__date">{{ trip.arrivalDate }}</span>
          </div>
        </div>

        <v-divider class="trips-page__divider"></v-divider>

        <div class="trips-page__details">
          <div class="trips-page__bus">
            <v-icon size="small" class="trips-page__icon">mdi-bus-side</v-icon>
            {{ getBusPlate(trip.busId) }} ({{ getBusModelName(trip.busId) }})
          </div>
          <div class="trips-page__driver">
            <v-icon size="small" class="trips-page__icon">mdi-account</v-icon>
            {{ getDriverName(trip.driverId) }}
          </div>
        </div>

        <v-divider class="trips-page__divider"></v-divider>

        <div class="trips-page__extra">
          <div class="trips-page__travel-time">
            <v-icon size="small" class="trips-page__icon">mdi-clock-outline</v-icon>
            {{ computeTravelTime(trip) }}
          </div>
          <v-chip :color="getStatusColor(trip)" dark size="small">
            {{ getStatusText(trip) }}
          </v-chip>
        </div>

        <div class="trips-page__actions">
          <v-btn icon variant="text" @click="editTrip(trip)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" @click="deleteTrip(trip.id, `${getStationName(trip.departureStationId)} → ${getStationName(trip.arrivalStationId)} ${trip.departureDate}`)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </v-card>
    </div>

    <div v-else class="trips-page__empty">
      <v-icon size="48" color="gray">mdi-bus-alert</v-icon>
      <p class="trips-page__empty-text">Нет рейсов на выбранную дату</p>
    </div>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Редактировать рейс' : 'Новый рейс' }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                label="Станция отправления"
                :items="stationStore.stations"
                item-value="id"
                item-title="name"
                v-model="form.departureStationId"
                :rules="[v => !!v || 'Выберите станцию']"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Станция прибытия"
                :items="stationStore.stations"
                item-value="id"
                item-title="name"
                v-model="form.arrivalStationId"
                :rules="[v => !!v || 'Выберите станцию']"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                label="Автобус"
                :items="busesWithModel"
                item-value="id"
                item-title="displayName"
                v-model="form.busId"
                :rules="[v => !!v || 'Выберите автобус']"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Водитель"
                :items="driverStore.drivers"
                item-value="id"
                item-title="fullName"
                v-model="form.driverId"
                :rules="[v => !!v || 'Выберите водителя']"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                type="date"
                label="Дата отправления"
                v-model="form.departureDate"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                type="time"
                label="Время отправления"
                v-model="form.departureTime"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                type="date"
                label="Дата прибытия"
                v-model="form.arrivalDate"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                type="time"
                label="Время прибытия"
                v-model="form.arrivalTime"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveTrip">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Закрыть</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title>Подтверждение удаления</v-card-title>
        <v-card-text>Вы уверены, что хотите удалить рейс <strong>{{ confirmDialog.tripInfo }}</strong>?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmDialog.show = false">Отмена</v-btn>
          <v-btn color="error" @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useTripStore } from '../stores/useTripStore'
  import { useStationStore } from '../stores/useStationStore'
  import { useBusStore } from '../stores/useBusStore'
  import { useDriverStore } from '../stores/useDriverStore'
  import { useBusModelStore } from '../stores/useBusModelStore'

  const tripStore = useTripStore()
  const stationStore = useStationStore()
  const busStore = useBusStore()
  const driverStore = useDriverStore()
  const busModelStore = useBusModelStore()

  const selectedDate = ref(new Date().toISOString().slice(0, 10))
  const dateMenu = ref(false)
  const formattedSelectedDate = computed(() => {
    if (!selectedDate.value) return ''
    const [year, month, day] = selectedDate.value.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  })
  const minDate = ref(new Date().toISOString().slice(0, 10))
  const maxDate = ref('2026-12-31')
  const clearDate = () => {
    selectedDate.value = ''
  }
  const snackbar = ref({ show: false, text: '', color: 'error' })
  const confirmDialog = ref({
    show: false,
    tripId: null,
    tripInfo: ''
  })

  const onDateSelect = (date) => {
    if (date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      selectedDate.value = `${year}-${month}-${day}`;
    } else {
      selectedDate.value = '';
    }
    dateMenu.value = false;

  }

  const filteredTrips = computed(() => {
    if (!selectedDate.value) return tripStore.trips
    return tripStore.trips.filter(trip => trip.departureDate === selectedDate.value)
  })

  const getStationName = (id) => {
    const station = stationStore.stations.find(s => s.id === id)
    return station ? station.name : '—'
  }

  const getDriverName = (id) => {
    const driver = driverStore.drivers.find(d => d.id === id)
    return driver ? driver.fullName : '—'
  }

  const getBusPlate = (busId) => {
    const bus = busStore.buses.find(b => b.id === busId)
    return bus ? bus.plateNumber : '—'
  }

  const getBusModelName = (busId) => {
    const bus = busStore.buses.find(b => b.id === busId)
    if (!bus) return '—'
    const model = busModelStore.busModels.find(m => m.id === bus.busModelId)
    return model ? model.name : '—'
  }

  const busesWithModel = computed(() => {
    return busStore.buses.map(bus => {
      const model = busModelStore.busModels.find(m => m.id === bus.busModelId)
      const modelName = model ? model.name : '—'
      return {
        id: bus.id,
        displayName: `${bus.plateNumber} (${modelName})`
      }
    })
  })

  const computeTravelTime = (trip) => {
    const dep = new Date(`${trip.departureDate}T${trip.departureTime}`)
    const arr = new Date(`${trip.arrivalDate}T${trip.arrivalTime}`)
    const diffHours = (arr - dep) / (1000 * 60 * 60)
    return diffHours.toFixed(1) + ' ч'
  }

  const getStatusText = (trip) => {
    const now = new Date()
    const dep = new Date(`${trip.departureDate}T${trip.departureTime}`)
    const arr = new Date(`${trip.arrivalDate}T${trip.arrivalTime}`)
    if (now >= dep && now < arr) return 'В пути'
    if (now >= arr) return 'Выполнен'
    return 'Ожидает'
  }
  const getStatusColor = (trip) => {
    const status = getStatusText(trip)
    if (status === 'В пути') return 'var(--color-secondary)'
    if (status === 'Выполнен') return 'var(--color-primary)'
    return 'var(--color-accent-warning)'
  }

  const dialog = ref(false)
  const isEdit = ref(false)
  const form = ref({
    departureStationId: null,
    arrivalStationId: null,
    busId: null,
    driverId: null,
    departureDate: selectedDate.value,
    departureTime: '09:00',
    arrivalDate: selectedDate.value,
    arrivalTime: '13:00',
  })

  const openAddDialog = () => {
    isEdit.value = false
    form.value = {
      departureStationId: null,
      arrivalStationId: null,
      busId: null,
      driverId: null,
      departureDate: selectedDate.value || new Date().toISOString().slice(0, 10),
      departureTime: '09:00',
      arrivalDate: selectedDate.value || new Date().toISOString().slice(0, 10),
      arrivalTime: '13:00',
    }
    dialog.value = true
  }

  const editTrip = (trip) => {
    isEdit.value = true
    form.value = { ...trip }
    dialog.value = true
  }

  const saveTrip = () => {
    if (!form.value.departureStationId || !form.value.arrivalStationId ||
      !form.value.busId || !form.value.driverId ||
      !form.value.departureDate || !form.value.departureTime ||
      !form.value.arrivalDate || !form.value.arrivalTime) {
      snackbar.value = { show: true, text: 'Заполните все поля', color: 'error' }
      return
    }
    if (isEdit.value) {
      tripStore.updateTrip(form.value.id, form.value)
    } else {
      tripStore.addTrip(form.value)
    }
    dialog.value = false
  }

  const deleteTrip = (id, tripInfo) => {
    confirmDialog.value = {
      show: true,
      tripId: id,
      tripInfo: tripInfo
    }
  }

  const confirmDelete = () => {
    tripStore.deleteTrip(confirmDialog.value.tripId)
    confirmDialog.value.show = false
  }


</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .trips-page {
     &__header {
       display: flex;
       flex-wrap: wrap;
       gap: var(--spacing-6);
       align-items: stretch;
       margin-block: var(--spacing-6);

       @include tablet {
         flex-direction: column;
         gap: var(--spacing-4);
         width: 100%;
       }
     }

     &__filter {
       flex: 0 0 auto;
       min-width: to-rem(300);

       @include tablet {
         min-width: 100%;
         flex: none;
       }

       .v-text-field {
         width: 100%;
       }
     }

     &__add-btn {
       display: flex;
       flex: 0 0 auto;

       @include tablet {
         width: 100%;
         margin-top: 0;
       }
      }

     &__btn {
       width: 100%;
       height: 100%;
       white-space: nowrap;

       @include tablet {
         white-space: normal;
         padding: var(--spacing-4);
       }
     }

     &__list {
       display: flex;
       flex-direction: column;
       gap: var(--spacing-4);
     }

     &__card {
       padding: var(--spacing-4);
       transition: all 0.2s ease;

       &:hover {
         transform: translateY(-2px);
         box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
       }
     }

     &__route {
       display: flex;
       align-items: center;
       gap: var(--spacing-2);
       font-weight: 600;
       margin-bottom: var(--spacing-3);

       @include mobile-b {
         flex-direction: column;
         text-align: center;
         gap: var(--spacing-1);

         .trips-page__arrow {
           transform: rotate(90deg);
         }
       }
     }

     &__city {
       font-size: 1.1rem;
     }

     &__times {
       display: flex;
       justify-content: space-between;
       margin-bottom: var(--spacing-3);

       @include mobile-b {
         flex-direction: column;
         gap: var(--spacing-2);
       }
     }

     &__time-block {
       display: flex;
       align-items: baseline;
       gap: var(--spacing-2);
       flex-wrap: wrap;

       &--departure .trips-page__time {
         font-weight: 500;
       }

       &--arrival .trips-page__time {
         font-weight: 500;
       }
     }

     &__time {
       font-size: 1rem;
     }

     &__date {
       font-size: 0.75rem;
       color: gray;
     }

     &__divider {
       margin: var(--spacing-3) 0;
     }

     &__details {
       display: flex;
       gap: var(--spacing-4);
       margin-bottom: var(--spacing-3);

       @include mobile-b {
         flex-direction: column;
         gap: var(--spacing-2);
       }
     }

     &__bus, &__driver {
       display: flex;
       align-items: center;
       gap: var(--spacing-2);
       font-size: 0.85rem;
     }

     &__extra {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: var(--spacing-3);

       @include mobile-b {
         flex-direction: column;
         align-items: flex-start;
         gap: var(--spacing-2);
       }
     }

     &__travel-time {
       display: flex;
       align-items: center;
       gap:var(--spacing-1);
       font-size: 0.85rem;
     }

     &__actions {
       display: flex;
       justify-content: flex-end;
       gap: var(--spacing-2);
       margin-top: var(--spacing-2);
     }

     &__empty {
       text-align: center;
       padding: var(--spacing-8) 0;
       color: var(--color-text-secondary);
     }

     &__empty-text {
       margin-top: var(--spacing-3);
     }
  }
</style>

