<template>
  <div class="buses-page">
    <div class="buses-page__toolbar">
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon> Добавить
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        :disabled="!selectedBus"
        @click="openEditDialog"
      >
        <v-icon left>mdi-pencil</v-icon> Редактировать
      </v-btn>
      <v-btn
        color="error"
        variant="outlined"
        :disabled="!selectedBus"
        @click="openDeleteConfirm"
      >
        <v-icon left>mdi-delete</v-icon> Удалить
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="busStore.buses"
      item-value="id"
      class="buses-table"
    >
      <template v-slot:item="{ item }">
        <tr
          :key="item.id"
          :class="selectedBus && selectedBus.id === item.id ? 'selected-row' : ''"
          @click="onRowClick(item)"
          style="cursor: pointer;"
        >
          <td>{{ item.plateNumber }}</td>
          <td>{{ getModelName(item.busModelId) }}</td>
        </tr>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Редактировать автобус' : 'Новый автобус' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.plateNumber"
            label="Госномер"
            required
            :rules="[v => !!v || 'Введите госномер']"
          />
          <v-select
            v-model="form.busModelId"
            label="Марка автобуса"
            :items="busModelStore.busModels"
            item-value="id"
            item-title="name"
            :rules="[v => !!v || 'Выберите марку']"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Отмена</v-btn>
          <v-btn color="primary" @click="saveBus">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model:show="confirmDialog.show"
      :message="`Удалить автобус ${confirmDialog.busPlate}?`"
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
  import { ref } from 'vue'
  import { useBusStore } from '../stores/useBusStore'
  import { useBusModelStore } from '../stores/useBusModelStore'
  import ConfirmDialog from '../components/common/ConfirmDialog.vue'

  const busStore = useBusStore()
  const busModelStore = useBusModelStore()

  const selectedBus = ref(null)
  const dialog = ref(false)
  const isEdit = ref(false)
  const form = ref({
    plateNumber: '',
    busModelId: null,
  })
  const snackbar = ref({ show: false, text: '', color: 'error' })
  const confirmDialog = ref({
    show: false,
    busId: null,
    busPlate: ''
  })

  const headers = [
    { title: 'Госномер', key: 'plateNumber', sortable: true },
    { title: 'Марка', key: 'busModelId', sortable: true },
  ]

  const getModelName = (modelId) => {
    const model = busModelStore.busModels.find(m => m.id === modelId)
    return model ? model.name : '—'
  }

  const onRowClick = (item) => {
    if (selectedBus.value && selectedBus.value.id === item.id) {
      selectedBus.value = null
    } else {
      selectedBus.value = item
    }
  }

  const openAddDialog = () => {
    isEdit.value = false
    form.value = {
      plateNumber: '',
      busModelId: null,
    }
    selectedBus.value = null
    dialog.value = true
  }

  const openEditDialog = () => {
    if (!selectedBus.value) return
    isEdit.value = true
    form.value = {
      id: selectedBus.value.id,
      plateNumber: selectedBus.value.plateNumber || '',
      busModelId: selectedBus.value.busModelId || null,
    }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
  }

  const saveBus = () => {
    if (!form.value.plateNumber || !form.value.busModelId) {
      snackbar.value = {
        show: true,
        text: 'Заполните все поля',
        color: 'error'
      }
      return
    }

    const busData = {
      plateNumber: form.value.plateNumber,
      busModelId: form.value.busModelId,
    }

    if (isEdit.value) {
      busStore.updateBus(form.value.id, busData)
      const updatedBus = busStore.buses.find(b => b.id === form.value.id)
      selectedBus.value = updatedBus || null
      snackbar.value = { show: true, text: 'Автобус обновлён', color: 'success' }
    } else {
      busStore.addBus(busData)
      const addedBus = busStore.buses[busStore.buses.length - 1]
      selectedBus.value = addedBus
      snackbar.value = { show: true, text: 'Автобус добавлен', color: 'success' }
    }
    dialog.value = false
  }

  const openDeleteConfirm = () => {
    if (!selectedBus.value) return
    confirmDialog.value = {
      show: true,
      busId: selectedBus.value.id,
      busPlate: selectedBus.value.plateNumber
    }
  }

  const confirmDelete = () => {
    const id = confirmDialog.value.busId
    busStore.deleteBus(id)
    if (selectedBus.value && selectedBus.value.id === id) {
      selectedBus.value = null
    }
    confirmDialog.value.show = false
    snackbar.value = { show: true, text: 'Автобус удалён', color: 'success' }
  }
</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .buses-page {
    &__toolbar {
      display: flex;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-6);
      flex-wrap: wrap;
    }

    .buses-table {
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
