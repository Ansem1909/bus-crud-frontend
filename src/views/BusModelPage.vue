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
        <v-icon size="small" @click="deleteBusModel(item.id)">mdi-delete</v-icon>
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
      alert('Введите название марки')
      return
    }
    if (isEdit.value) {
      busModelStore.updateBusModel(form.value.id, form.value.name)
    } else {
      busModelStore.addBusModel(form.value.name)
    }
    dialog.value = false
  }

  const deleteBusModel = (id) => {
    if (confirm('Удалить марку?')) {
      busModelStore.deleteBusModel(id)
    }
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
