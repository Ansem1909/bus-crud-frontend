import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/axios';

export const useBusModelStore = defineStore('busModels', () => {
  const busModels = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchBusModels = async () => {
    loading.value = true;
    try {
      const response = await api.get('/BusModels');
      busModels.value = response.data;
    } catch (err) {
      error.value = err.message;
      console.error('Ошибка загрузки марок:', err);
    } finally {
      loading.value = false;
    }
  };

  const addBusModel = async (name) => {
    try {
      const response = await api.post('/BusModels', { name });
      busModels.value.push(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка добавления марки:', err);
      throw err;
    }
  };

  const updateBusModel = async (id, updated) => {
    try {
      await api.put(`/BusModels/${id}`, { ...updated, id });
      const index = busModels.value.findIndex(m => m.id === id);
      if (index !== -1) {
        busModels.value[index] = { ...busModels.value[index], ...updated };
      }
    } catch (err) {
      console.error('Ошибка обновления марки:', err);
      throw err;
    }
  };

  const deleteBusModel = async (id) => {
    try {
      await api.delete(`/BusModels/${id}`);
      busModels.value = busModels.value.filter(m => m.id !== id);
    } catch (err) {
      console.error('Ошибка удаления марки:', err);
      throw err;
    }
  };

  return { busModels, loading, error, fetchBusModels, addBusModel, updateBusModel, deleteBusModel };
})
