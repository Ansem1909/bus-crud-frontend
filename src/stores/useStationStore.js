import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/axios';

export const useStationStore = defineStore('stations', () => {
  const stations = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchStations = async () => {
    loading.value = true;
    try {
      const response = await api.get('/Stations');
      stations.value = response.data;
    } catch (err) {
      error.value = err.message;
      console.error('Ошибка загрузки станций:', err);
    } finally {
      loading.value = false;
    }
  };

  const addStation = async (name) => {
    try {
      const response = await api.post('/Stations', { name });
      stations.value.push(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка добавления станции:', err);
      throw err;
    }
  };

  const updateStation = async (id, updated) => {
    try {
      await api.put(`/Stations/${id}`, { ...updated, id });
      const index = stations.value.findIndex(s => s.id === id);
      if (index !== -1) {
        stations.value[index] = { ...stations.value[index], ...updated };
      }
    } catch (err) {
      console.error('Ошибка обновления станции:', err);
      throw err;
    }
  };

  const deleteStation = async (id) => {
    try {
      await api.delete(`/Stations/${id}`);
      stations.value = stations.value.filter(s => s.id !== id);
    } catch (err) {
      console.error('Ошибка удаления станции:', err);
      throw err;
    }
  };

  return { stations, loading, error, fetchStations, addStation, updateStation, deleteStation };
});
