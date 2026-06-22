<template>
  <div class="station-page">
    <div class="station-page__toolbar">
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon> Добавить
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        :disabled="!selectedStation"
        @click="openEditDialog"
      >
        <v-icon left>mdi-pencil</v-icon> Редактировать
      </v-btn>
      <v-btn
        color="error"
        variant="outlined"
        :disabled="!selectedStation"
        @click="openDeleteConfirm"
      >
        <v-icon left>mdi-delete</v-icon> Удалить
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="stationStore.stations"
      item-value="id"
      class="station-table"
    >
      <template v-slot:item="{ item }">
        <tr
          :key="item.id"
          :class="selectedStation && selectedStation.id === item.id ? 'selected-row' : ''"
          @click="onRowClick(item)"
          style="cursor: pointer;"
        >
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
        </tr>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Редактировать станцию' : 'Новая станция' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Название станции"
            required
            :rules="[v => !!v || 'Введите название']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Отмена</v-btn>
          <v-btn color="primary" @click="saveStation">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model:show="confirmDialog.show"
      :message="`Удалить станцию ${confirmDialog.stationName}?`"
      @confirmed="confirmDelete"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Закрыть</v-btn>
      </template>
    </v-snackbar>


  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useStationStore } from '../stores/useStationStore'
  import ConfirmDialog from '../components/common/ConfirmDialog.vue'

  const stationStore = useStationStore()

  const selectedStation = ref(null)
  const dialog = ref(false)
  const isEdit = ref(false)
  const form = ref({
    name: '',
  })
  const snackbar = ref({ show: false, text: '', color: 'error' })
  const confirmDialog = ref({
    show: false,
    stationId: null,
    stationName: ''
  })

  const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Название', key: 'name', sortable: true },
  ]

  onMounted(() => {
    stationStore.fetchStations()
  })

  const onRowClick = (item) => {
    if (selectedStation.value && selectedStation.value.id === item.id) {
      selectedStation.value = null
    } else {
      selectedStation.value = item
    }
  }

  const openAddDialog = () => {
    isEdit.value = false
    form.value = { name: '' }
    selectedStation.value = null
    dialog.value = true
  }

  const openEditDialog = () => {
    if (!selectedStation.value) return
    isEdit.value = true
    form.value = {
      id: selectedStation.value.id,
      name: selectedStation.value.name || '',
    }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
  }

  const saveStation = async () => {
    if (!form.value.name) {
      snackbar.value = { show: true, text: 'Введите название станции', color: 'error' }
      return
    }

    try {
      if (isEdit.value) {
        await stationStore.updateStation(form.value.id, { name: form.value.name })
        snackbar.value = { show: true, text: 'Станция обновлена', color: 'success' }
      } else {
        await stationStore.addStation(form.value.name)
        snackbar.value = { show: true, text: 'Станция добавлена', color: 'success' }
      }
      dialog.value = false
      await stationStore.fetchStations()
    } catch (error) {
      snackbar.value = { show: true, text: error.response?.data || 'Ошибка сохранения', color: 'error' }
    }
  }

  const openDeleteConfirm = () => {
    if (!selectedStation.value) return
    confirmDialog.value = {
      show: true,
      stationId: selectedStation.value.id,
      stationName: selectedStation.value.name
    }
  }

  const confirmDelete = async () => {
    const id = confirmDialog.value.stationId
    try {
      await stationStore.deleteStation(id)
      if (selectedStation.value && selectedStation.value.id === id) {
        selectedStation.value = null
      }
      confirmDialog.value.show = false
      snackbar.value = { show: true, text: 'Станция удалена', color: 'success' }
      await stationStore.fetchStations()
    } catch (error) {
      snackbar.value = { show: true, text: error.response?.data || 'Ошибка удаления', color: 'error' }
    }
  }
</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .station-page {
    &__toolbar {
      display: flex;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-6);
      flex-wrap: wrap;
    }

    .station-table {
      background: var(--color-surface);

      :deep(tr) {
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
        }
      }

      :deep(.selected-row) {
        background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
        border-left: 4px solid var(--color-primary);

        &:hover {
          background-color: color-mix(in srgb, var(--color-primary) 25%, transparent);
        }
      }
    }
  }
</style>
