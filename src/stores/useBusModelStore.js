import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBusModelStore = defineStore('busModels', () => {
  const busModels = ref([
    { id: 1, name: 'ЛиАЗ' },
    { id: 2, name: 'МАЗ' },
    { id: 3, name: 'Neoplan' },
    { id: 4, name: 'Setra' },
  ])

  const addBusModel = (name) => {
    const newId = Math.max(...busModels.value.map(m => m.id), 0) + 1
    busModels.value.push({ id: newId, name })
  }

  const updateBusModel = (id, name) => {
    const index = busModels.value.findIndex(m => m.id === id)
    if (index !== -1) busModels.value[index].name = name
  }

  const deleteBusModel = (id) => {
    busModels.value = busModels.value.filter(m => m.id !== id)
  }

  return { busModels, addBusModel, updateBusModel, deleteBusModel }
})
