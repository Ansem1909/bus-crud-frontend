<template>
  <div class="busmodel-page">
    <div class="busmodel-page__toolbar">
      <v-btn
        color="primary"
        @click="openAddDialog"
        prepend-icon="mdi-plus"
      >
        Добавить
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-pencil"
        :disabled="!selectedModel"
        @click="openEditDialog"
      >
        Редактировать
      </v-btn>
      <v-btn
        color="error"
        variant="outlined"
        prepend-icon="mdi-delete"
        :disabled="!selectedModel"
        @click="openDeleteConfirm"
      >
        Удалить
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="busModelStore.busModels"
      item-value="id"
      class="busmodel-table"
    >
      <template v-slot:item="{ item }">
        <tr
          :key="item.id"
          :data-id="item.id"
          :tabindex="0"
          :class="selectedModel?.id === item.id ? 'selected-row' : ''"
          @click="onRowClick(item)"
          @keydown="onRowKeydown($event, item)"
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
          {{ isEdit ? 'Редактировать марку' : 'Новая марка' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Название марки"
            required
            :rules="[v => !!v || 'Введите название']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Отмена</v-btn>
          <v-btn color="primary" @click="saveModel">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model:show="confirmDialog.show"
      :message="`Удалить марку ${confirmDialog.modelName}?`"
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
  import { useBusModelStore } from '../stores/useBusModelStore'
  import ConfirmDialog from '../components/common/ConfirmDialog.vue'
  import { useTableKeyboard } from '../composables/useTableKeyboard'

  const busModelStore = useBusModelStore()

  const selectedModel = ref(null)
  const dialog = ref(false)
  const isEdit = ref(false)
  const form = ref({
    name: '',
  })
  const snackbar = ref({ show: false, text: '', color: 'error' })
  const confirmDialog = ref({
    show: false,
    modelId: null,
    modelName: ''
  })

  const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Название', key: 'name', sortable: true },
  ]

  onMounted(() => {
    busModelStore.fetchBusModels()
  })

  const onRowClick = (item) => {
    if (selectedModel.value?.id === item.id) {
      selectedModel.value = null
    } else {
      selectedModel.value = { ...item }
    }
  }

  const openAddDialog = () => {
    isEdit.value = false
    form.value = { name: '' }
    selectedModel.value = null
    dialog.value = true
  }

  const openEditDialog = () => {
    if (!selectedModel.value) return
    isEdit.value = true
    form.value = {
      id: selectedModel.value.id,
      name: selectedModel.value.name || '',
    }
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
  }

  const saveModel = async () => {
    if (!form.value.name) {
      snackbar.value = { show: true, text: 'Введите название марки', color: 'error' }
      return
    }

    try {
      if (isEdit.value) {
        await busModelStore.updateBusModel(form.value.id, { name: form.value.name })
        snackbar.value = { show: true, text: 'Марка обновлена', color: 'success' }
      } else {
        await busModelStore.addBusModel(form.value.name)
        snackbar.value = { show: true, text: 'Марка добавлена', color: 'success' }
      }
      dialog.value = false
      await busModelStore.fetchBusModels()
    } catch (error) {
      snackbar.value = { show: true, text: error.response?.data || 'Ошибка сохранения', color: 'error' }
    }
  }

  const openDeleteConfirm = () => {
    if (!selectedModel.value) return
    confirmDialog.value = {
      show: true,
      modelId: selectedModel.value.id,
      modelName: selectedModel.value.name
    }
  }

  const confirmDelete = async () => {
    const id = confirmDialog.value.modelId
    try {
      await busModelStore.deleteBusModel(id)
      if (selectedModel.value && selectedModel.value.id === id) {
        selectedModel.value = null
      }
      confirmDialog.value.show = false
      snackbar.value = { show: true, text: 'Марка удалена', color: 'success' }
      await busModelStore.fetchBusModels()
    } catch (error) {
      snackbar.value = { show: true, text: error.response?.data || 'Ошибка удаления', color: 'error' }
    }
  }

  const { onRowKeydown } = useTableKeyboard({
    selectedItem: selectedModel,
    onSelect: onRowClick,
    onDelete: openDeleteConfirm,
    tableSelector: '.busmodel-table',
  })
</script>


<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .busmodel-page {
    &__toolbar {
      display: flex;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-6);
      flex-wrap: wrap;
    }

    .busmodel-table {
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
