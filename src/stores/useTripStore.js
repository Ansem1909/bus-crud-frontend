import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api/axios';

export const useTripStore = defineStore('trips', () => {
  const trips = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchTrips = async (date = null) => {
    loading.value = true;
    try {
      let url = '/Trips';
      if (date) {
        url += `?date=${date}`;
      }
      const response = await api.get(url);
      trips.value = response.data;
    } catch (err) {
      error.value = err.message;
      console.error('Ошибка загрузки рейсов:', err);
    } finally {
      loading.value = false;
    }
  };

  const addTrip = async (tripData) => {
    try {
      const response = await api.post('/Trips', tripData);
      trips.value.push(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка добавления рейса:', err);
      throw err;
    }
  };

  const updateTrip = async (id, tripData) => {
    try {
      await api.put(`/Trips/${id}`, { ...tripData, id });
      const index = trips.value.findIndex(t => t.id === id);
      if (index !== -1) {
        trips.value[index] = { ...trips.value[index], ...tripData };
      }
    } catch (err) {
      console.error('Ошибка обновления рейса:', err);
      throw err;
    }
  };

  const deleteTrip = async (id) => {
    try {
      await api.delete(`/Trips/${id}`);
      trips.value = trips.value.filter(t => t.id !== id);
    } catch (err) {
      console.error('Ошибка удаления рейса:', err);
      throw err;
    }
  };

  return { trips, loading, error, fetchTrips, addTrip, updateTrip, deleteTrip };
});
