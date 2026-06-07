<template>
  <div>

    <v-row align="center" class="mb-4">
      <v-col cols="4">
        <v-text-field
          type="date"
          label="Дата рейсов"
          v-model="selectedDate"
          @update:model-value="filterTrips"
          hide-details
        />
      </v-col>
      <v-col cols="8" class="text-right">
        <v-btn color="primary" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>
          Добавить рейс
        </v-btn>
      </v-col>
    </v-row>


    <v-data-table
      :headers="headers"
      :items="filteredTrips"
      item-value="id"
      class="elevation-1"
    >

      <template v-slot:item.departure="{ item }">
        <div>{{ getStationName(item.departureStationId) }}</div>
        <div class="text-caption">{{ item.departureDate }} {{ item.departureTime }}</div>
      </template>


      <template v-slot:item.arrival="{ item }">
        <div>{{ getStationName(item.arrivalStationId) }}</div>
        <div class="text-caption">{{ item.arrivalDate }} {{ item.arrivalTime }}</div>
      </template>


      <template v-slot:item.bus="{ item }">
        <div>{{ getBusPlate(item.busId) }}</div>
        <div class="text-caption">{{ getBusModelName(item.busId) }}</div>
      </template>


      <template v-slot:item.driver="{ item }">
        {{ getDriverName(item.driverId) }}
      </template>


      <template v-slot:item.travelTime="{ item }">
        {{ computeTravelTime(item) }}
      </template>


      <template v-slot:item.status="{ item }">
        <v-chip :color="getStatusColor(item)" dark size="small">
          {{ getStatusText(item) }}
        </v-chip>
      </template>


      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="me-2" @click="editTrip(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteTrip(item.id)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>


    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Редактировать рейс' : 'Новый рейс' }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
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
            <v-col cols="6">
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
            <v-col cols="6">
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
            <v-col cols="6">
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
            <v-col cols="6">
              <v-text-field
                type="date"
                label="Дата отправления"
                v-model="form.departureDate"
                required
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                type="time"
                label="Время отправления"
                v-model="form.departureTime"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                type="date"
                label="Дата прибытия"
                v-model="form.arrivalDate"
                required
              />
            </v-col>
            <v-col cols="6">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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


const filteredTrips = computed(() => {
  return tripStore.trips.filter(trip => trip.departureDate === selectedDate.value)
})


const headers = [
  { title: 'Отправление', key: 'departure', sortable: false },
  { title: 'Прибытие', key: 'arrival', sortable: false },
  { title: 'Автобус', key: 'bus', sortable: false },
  { title: 'Водитель', key: 'driver', sortable: false },
  { title: 'Время в пути', key: 'travelTime', sortable: false },
  { title: 'Статус', key: 'status', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center' },
]


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
  if (status === 'В пути') return 'orange'
  if (status === 'Выполнен') return 'green'
  return 'blue'
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
    departureDate: selectedDate.value,
    departureTime: '09:00',
    arrivalDate: selectedDate.value,
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
    alert('Заполните все поля')
    return
  }
  if (isEdit.value) {
    tripStore.updateTrip(form.value.id, form.value)
  } else {
    tripStore.addTrip(form.value)
  }
  dialog.value = false
}

const deleteTrip = (id) => {
  if (confirm('Удалить этот рейс?')) {
    tripStore.deleteTrip(id)
  }
}
const filterTrips = () => {}
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
