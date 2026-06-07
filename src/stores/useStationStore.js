import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStationStore = defineStore('stations', () => {
  const stations = ref([
    { id: 1, name: 'Москва' },
    { id: 2, name: 'Санкт-Петербург' },
    { id: 3, name: 'Нижний Новгород' },
    { id: 4, name: 'Казань' },
    { id: 5, name: 'Екатеринбург' },
  ])

  const addStation = (name) => {
    const newId = Math.max(...stations.value.map(s => s.id), 0) + 1
    stations.value.push({ id: newId, name })
  }

  const updateStation = (id, name) => {
    const index = stations.value.findIndex(s => s.id === id)
    if (index !== -1) stations.value[index].name = name
  }

  const deleteStation = (id) => {
    stations.value = stations.value.filter(s => s.id !== id)
  }

  return { stations, addStation, updateStation, deleteStation }
})
