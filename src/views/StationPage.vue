<template>
  <div class="station-page">
    <div class="station-page__header">
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon>
        Добавить станцию
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="stationStore.stations"
      item-value="id"
      class="station-table"
    >
      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="me-2" @click="editStation(item)">mdi-pencil</v-icon>
        <v-icon size="small" @click="deleteStation(item.id, item.name)">mdi-delete</v-icon>
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
            :rules="[v => !!v || 'Введите название']"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveStation">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Закрыть</v-btn>
      </template>
    </v-snackbar>

    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title>Подтверждение удаления</v-card-title>
        <v-card-text>Вы уверены, что хотите удалить станцию <strong>{{ confirmDialog.stationName }}</strong>?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmDialog.show = false">Отмена</v-btn>
          <v-btn color="error" @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useStationStore } from '../stores/useStationStore'

  const stationStore = useStationStore()

  const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Название', key: 'name' },
    { title: 'Действия', key: 'actions', sortable: false },
  ]

  const dialog = ref(false)
  const isEdit = ref(false)
  const form = ref({ name: '' })

  const snackbar = ref({ show: false, text: '', color: 'error' })
  const confirmDialog = ref({
    show: false,
    stationId: null,
    stationName: ''
  })

  const openAddDialog = () => {
    isEdit.value = false
    form.value = { name: '' }
    dialog.value = true
  }

  const editStation = (station) => {
    isEdit.value = true
    form.value = { ...station }
    dialog.value = true
  }

  const saveStation = () => {
    if (!form.value.name) {
      snackbar.value = { show: true, text: 'Введите название станции', color: 'error' }
      return
    }
    if (isEdit.value) {
      stationStore.updateStation(form.value.id, { name: form.value.name })
    } else {
      stationStore.addStation(form.value.name)
    }
    dialog.value = false
  }

  const deleteStation = (id, name) => {
    confirmDialog.value = {
      show: true,
      stationId: id,
      stationName: name
    }
  }

  const confirmDelete = () => {
    stationStore.deleteStation(confirmDialog.value.stationId)
    confirmDialog.value.show = false
  }
</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .station-page {
    &__header {
      margin-bottom: var(--spacing-6);
      text-align: right;
    }
    .station-table {
      background: var(--color-surface);
    }
  }
</style>
