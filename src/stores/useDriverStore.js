import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDriverStore = defineStore('drivers', () => {
  const drivers = ref([
    {
      id: 1,
      lastName: 'Иванов',
      firstName: 'Иван',
      patronymic: 'Иванович',
      birthDate: '1980-05-15'
    },
    {
      id: 2,
      lastName: 'Петров',
      firstName: 'Пётр',
      patronymic: 'Петрович',
      birthDate: '1990-08-22'
    },
    {
      id: 3,
      lastName: 'Сидорова',
      firstName: 'Анна',
      patronymic: 'Сергеевна',
      birthDate: '1985-03-10'
    },
  ])

  const addDriver = (driver) => {
    const newId = Math.max(...drivers.value.map(d => d.id), 0) + 1
    drivers.value.push({ ...driver, id: newId })
  }

  const updateDriver = (id, updated) => {
    const index = drivers.value.findIndex(d => d.id === id)
    if (index !== -1) drivers.value[index] = { ...updated, id }
  }

  const deleteDriver = (id) => {
    drivers.value = drivers.value.filter(d => d.id !== id)
  }

  const getFullName = (id) => {
    const driver = drivers.value.find(d => d.id === id)
    if (!driver) return '—'
    return `${driver.lastName} ${driver.firstName} ${driver.patronymic}`.trim()
  }

  const formatFullName = (driver) => {
    if (!driver) return '—'
    return `${driver.lastName} ${driver.firstName} ${driver.patronymic}`.trim()
  }

  return { drivers, addDriver, updateDriver, deleteDriver, getFullName, formatFullName }
})
