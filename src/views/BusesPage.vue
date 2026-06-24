<template>
  <div class="buses-page">
    <div class="buses-page__toolbar">
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openAddDialog"
      >
        Добавить
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-pencil"
        :disabled="!selectedBus"
        @click="openEditDialog"
      >
        Редактировать
      </v-btn>
      <v-btn
        color="error"
        variant="outlined"
        prepend-icon="mdi-delete"
        :disabled="!selectedBus"
        @click="openDeleteConfirm"
      >
        Удалить
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
          :data-id="item.id"
          :tabindex="0"
          :class="selectedBus?.id === item.id ? 'selected-row' : ''"
          @click="onRowClick(item)"
          @keydown="onRowKeydown($event, item)"
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
  import { ref, onMounted } from 'vue'
  import { useBusStore } from '../stores/useBusStore'
  import { useBusModelStore } from '../stores/useBusModelStore'
  import ConfirmDialog from '../components/common/ConfirmDialog.vue'
  import { useTableKeyboard } from '../composables/useTableKeyboard'

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

  onMounted(async () => {
    await Promise.all([
      busStore.fetchBuses(),
      busModelStore.fetchBusModels(),
    ])
  })

  const getModelName = (modelId) => {
    const model = busModelStore.busModels.find(m => m.id === modelId)
    return model ? model.name : '—'
  }

  const onRowClick = (item) => {
    if (selectedBus.value?.id === item.id) {
      selectedBus.value = null
    } else {
      selectedBus.value = { ...item }
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

  const saveBus = async () => {
    if (!form.value.plateNumber || !form.value.busModelId) {
      snackbar.value = { show: true, text: 'Заполните все поля', color: 'error' }
      return
    }

    const busData = {
      plateNumber: form.value.plateNumber,
      busModelId: form.value.busModelId,
    }

    try {
      if (isEdit.value) {
        await busStore.updateBus(form.value.id, busData)
        snackbar.value = { show: true, text: 'Автобус обновлён', color: 'success' }
      } else {
        await busStore.addBus(busData)
        snackbar.value = { show: true, text: 'Автобус добавлен', color: 'success' }
      }
      dialog.value = false
      await busStore.fetchBuses()
    } catch (error) {
      snackbar.value = { show: true, text: error.response?.data || 'Ошибка сохранения', color: 'error' }
    }
  }

  const openDeleteConfirm = () => {
    console.log('openDeleteConfirm')

    if (!selectedBus.value) return

    confirmDialog.value.busId = selectedBus.value.id
    confirmDialog.value.busPlate = selectedBus.value.plateNumber
    confirmDialog.value.show = true

    console.log('confirmDialog', confirmDialog.value)
  }

  const confirmDelete = async () => {
    const id = confirmDialog.value.busId
    try {
      await busStore.deleteBus(id)
      selectedBus.value = null
      confirmDialog.value.show = false
      snackbar.value.text = 'Автобус удалён'
      snackbar.value.color = 'success'
      snackbar.value.show = true
      await busStore.fetchBuses()
    } catch (error) {
      snackbar.value.text = error.response?.data || 'Ошибка удаления'
      snackbar.value.color = 'error'
      snackbar.value.show = true
      confirmDialog.value.show = false
    }
  }

  const { onRowKeydown } = useTableKeyboard({
    selectedItem: selectedBus,
    onSelect: onRowClick,
    onDelete: openDeleteConfirm,
    tableSelector: '.buses-table',
  })

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
