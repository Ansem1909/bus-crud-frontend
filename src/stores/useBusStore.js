import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBusStore = defineStore('buses', () => {
  const buses = ref([
    { id: 1, plateNumber: 'А123ВС', busModelId: 1 },
    { id: 2, plateNumber: 'В456ЕК', busModelId: 2 },
    { id: 3, plateNumber: 'С789НМ', busModelId: 3 },
  ])

  const addBus = (bus) => {
    const newId = Math.max(...buses.value.map(b => b.id), 0) + 1
    buses.value.push({ ...bus, id: newId })
  }

  const updateBus = (id, updated) => {
    const index = buses.value.findIndex(b => b.id === id)
    if (index !== -1) buses.value[index] = { ...updated, id }
  }

  const deleteBus = (id) => {
    buses.value = buses.value.filter(b => b.id !== id)
  }

  return { buses, addBus, updateBus, deleteBus }
})
