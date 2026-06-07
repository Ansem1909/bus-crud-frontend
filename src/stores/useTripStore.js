import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTripStore = defineStore('trips', () => {
  const trips = ref([
    {
      id: 1,
      departureStationId: 1,
      arrivalStationId: 2,
      busId: 1,
      driverId: 1,
      departureDate: '2025-06-10',
      departureTime: '08:00',
      arrivalDate: '2025-06-10',
      arrivalTime: '12:30',
    },
    {
      id: 2,
      departureStationId: 2,
      arrivalStationId: 3,
      busId: 2,
      driverId: 2,
      departureDate: '2025-06-10',
      departureTime: '14:00',
      arrivalDate: '2025-06-10',
      arrivalTime: '18:45',
    },
    {
      id: 3,
      departureStationId: 1,
      arrivalStationId: 4,
      busId: 3,
      driverId: 3,
      departureDate: '2025-06-11',
      departureTime: '09:00',
      arrivalDate: '2025-06-11',
      arrivalTime: '15:20',
    },
  ])

  const addTrip = (trip) => {
    const newId = Math.max(...trips.value.map(t => t.id), 0) + 1
    trips.value.push({ ...trip, id: newId })
  }

  const updateTrip = (id, updated) => {
    const index = trips.value.findIndex(t => t.id === id)
    if (index !== -1) trips.value[index] = { ...updated, id }
  }

  const deleteTrip = (id) => {
    trips.value = trips.value.filter(t => t.id !== id)
  }

  return { trips, addTrip, updateTrip, deleteTrip }
})
