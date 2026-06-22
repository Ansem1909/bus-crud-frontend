import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/axios';

export const useDriverStore = defineStore('drivers', () => {
  const drivers = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchDrivers = async () => {
    loading.value = true;
    try {
      const response = await api.get('/Drivers');
      drivers.value = response.data;
    } catch (err) {
      error.value = err.message;
      console.error('Ошибка загрузки водителей:', err);
    } finally {
      loading.value = false;
    }
  };

  const addDriver = async (driverData) => {
    try {
      const response = await api.post('/Drivers', driverData);
      drivers.value.push(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка добавления водителя:', err);
      throw err;
    }
  };

  const updateDriver = async (id, driverData) => {
    try {
      await api.put(`/Drivers/${id}`, { ...driverData, id });
      const index = drivers.value.findIndex(d => d.id === id);
      if (index !== -1) {
        drivers.value[index] = { ...drivers.value[index], ...driverData };
      }
    } catch (err) {
      console.error('Ошибка обновления водителя:', err);
      throw err;
    }
  };

  const deleteDriver = async (id) => {
    try {
      await api.delete(`/Drivers/${id}`);
      drivers.value = drivers.value.filter(d => d.id !== id);
    } catch (err) {
      console.error('Ошибка удаления водителя:', err);
      throw err;
    }
  };

  const getFullName = (id) => {
    const driver = drivers.value.find(d => d.id === id);
    if (!driver) return '—';
    return `${driver.lastName} ${driver.firstName} ${driver.patronymic}`.trim();
  };

  const formatFullName = (driver) => {
    if (!driver) return '—';
    return `${driver.lastName} ${driver.firstName} ${driver.patronymic}`.trim();
  };

  return { drivers, loading, error, fetchDrivers, addDriver, updateDriver, deleteDriver, getFullName, formatFullName };
});
