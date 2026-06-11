<template>
  <div class="buses-page">

    <div class="buses-page__header">
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon>
        Добавить автобус
      </v-btn>
    </div>


    <div v-if="busStore.buses.length" class="buses-page__list">
      <v-row>
        <v-col
          v-for="bus in busStore.buses"
          :key="bus.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="buses-page__card" elevation="2">
            <v-card-title class="pa-4 pb-0">
              <div class="bus-plate">{{ bus.plateNumber }}</div>
            </v-card-title>
            <v-card-text class="pa-4 pt-2">
              <div class="bus-model">
                <v-icon size="small" class="mr-1">mdi-bus-side</v-icon>
                {{ getBusModelName(bus.busModelId) }}
              </div>
            </v-card-text>
            <v-card-actions class="pa-4 pt-0">
              <v-spacer></v-spacer>
              <v-btn icon variant="text" @click="editBus(bus)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon variant="text" @click="deleteBus(bus.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="buses-page__empty">
      <v-icon size="48" color="gray">mdi-bus-alert</v-icon>
      <p class="mt-2">Нет автобусов. Добавьте первый.</p>
    </div>


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
          <v-btn @click="dialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveBus">Сохранить</v-btn>
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
        <v-card-text>Вы уверены, что хотите удалить автобус <strong>{{ confirmDialog.busPlate }}</strong>?</v-card-text>
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
  import { useBusStore } from '../stores/useBusStore'
  import { useBusModelStore } from '../stores/useBusModelStore'

  const busStore = useBusStore()
  const busModelStore = useBusModelStore()

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

  const openAddDialog = () => {
    isEdit.value = false
    form.value = {
      plateNumber: '',
      busModelId: null,
    }
    dialog.value = true
  }

  const editBus = (bus) => {
    isEdit.value = true
    form.value = { ...bus }
    dialog.value = true
  }

  const saveBus = () => {
    if (!form.value.plateNumber || !form.value.busModelId) {
      snackbar.value = { show: true, text: 'Заполните все поля', color: 'error' }
      return
    }
    if (isEdit.value) {
      busStore.updateBus(form.value.id, form.value)
    } else {
      busStore.addBus(form.value)
    }
    dialog.value = false
  }

  const deleteBus = (id, plateNumber) => {
    confirmDialog.value = {
      show: true,
      busId: id,
      busPlate: plateNumber
    }
  }

  const confirmDelete = () => {
    busStore.deleteBus(confirmDialog.value.busId)
    confirmDialog.value.show = false
  }

  const getBusModelName = (modelId) => {
    const model = busModelStore.busModels.find(m => m.id === modelId)
    return model ? model.name : '—'
  }
</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .buses-page {
    &__header {
      margin-bottom: var(--spacing-6);
      text-align: right;
    }

    &__list {
      margin-top: var(--spacing-2);
    }

    &__card {
      height: 100%;
      transition: all 0.2s ease;
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
      .bus-plate {
        font-weight: 600;
        font-size: 1.2rem;
        word-break: break-word;
      }
      .bus-model {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: 0.9rem;
      }
    }

    &__empty {
      text-align: center;
      padding: var(--spacing-12) 0;
      color: var(--color-text-secondary);
    }
  }
</style>
