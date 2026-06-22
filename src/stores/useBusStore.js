import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/axios';

export const useBusStore = defineStore('buses', () => {
  const buses = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchBuses = async () => {
    loading.value = true;
    try {
      const response = await api.get('/Buses');
      buses.value = response.data;
      error.value = null;
    } catch (err) {
      error.value = err.message;
      console.error('Ошибка загрузки автобусов:', err);
    } finally {
      loading.value = false;
    }
  };

  const addBus = async (busData) => {
    try {
      const response = await api.post('/Buses', busData);
      buses.value.push(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка добавления автобуса:', err);
      throw err;
    }
  };

  const updateBus = async (id, busData) => {
    try {
      await api.put(`/Buses/${id}`, { ...busData, id });
      const index = buses.value.findIndex(b => b.id === id);
      if (index !== -1) {
        buses.value[index] = { ...buses.value[index], ...busData };
      }
    } catch (err) {
      console.error('Ошибка обновления автобуса:', err);
      throw err;
    }
  };

  const deleteBus = async (id) => {
    try {
      await api.delete(`/Buses/${id}`);
      buses.value = buses.value.filter(b => b.id !== id);
    } catch (err) {
      console.error('Ошибка удаления автобуса:', err);
      throw err;
    }
  };

  return { buses, loading, error, fetchBuses, addBus, updateBus, deleteBus };
});
