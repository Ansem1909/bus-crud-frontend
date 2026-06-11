<template>
  <div class="busmodel-page">
    <div class="busmodel-page__header">
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon>
        Добавить марку
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="busModelStore.busModels"
      item-value="id"
      class="busmodel-table"
    >
      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="me-2" @click="editBusModel(item)">mdi-pencil</v-icon>
        <v-icon size="small" @click="deleteBusModel(item.id, item.name)">mdi-delete</v-icon>
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
            :rules="[v => !!v || 'Введите название']"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveBusModel">Сохранить</v-btn>
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
        <v-card-text>Вы уверены, что хотите удалить марку <strong>{{ confirmDialog.modelName }}</strong>?</v-card-text>
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
  import { useBusModelStore } from '../stores/useBusModelStore'

  const busModelStore = useBusModelStore()

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
    modelId: null,
    modelName: ''
  })

  const openAddDialog = () => {
    isEdit.value = false
    form.value = { name: '' }
    dialog.value = true
  }

  const editBusModel = (model) => {
    isEdit.value = true
    form.value = { ...model }
    dialog.value = true
  }

  const saveBusModel = () => {
    if (!form.value.name) {
      snackbar.value = { show: true, text: 'Введите название марки', color: 'error' }
      return
    }
    if (isEdit.value) {
      busModelStore.updateBusModel(form.value.id, form.value.name)
    } else {
      busModelStore.addBusModel(form.value.name)
    }
    dialog.value = false
  }

  const deleteBusModel = (id, name) => {
    confirmDialog.value = {
      show: true,
      modelId: id,
      modelName: name
    }
  }

  const confirmDelete = () => {
    busModelStore.deleteBusModel(confirmDialog.value.modelId)
    confirmDialog.value.show = false
  }
</script>


<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .busmodel-page {
    &__header {
      margin-bottom: var(--spacing-6);
      text-align: right;
    }
    .busmodel-table {
      background: var(--color-surface);
    }
  }
</style>
