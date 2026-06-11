<template>
  <div class="drivers-page">
    <div class="drivers-page__header">
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon>
        Добавить водителя
      </v-btn>
    </div>

    <div v-if="driverStore.drivers.length" class="drivers-page__list">
      <v-row>
        <v-col
          v-for="driver in driverStore.drivers"
          :key="driver.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="drivers-page__card" elevation="2">
            <v-card-title class="pa-4 pb-0">
              <div class="driver-name">{{ driver.fullName }}</div>
            </v-card-title>
            <v-card-text class="pa-4 pt-2">
              <div class="driver-birth">
                <v-icon size="small" class="mr-1">mdi-cake-variant</v-icon>
                Дата рождения: {{ driver.birthDate }}
              </div>
              <div class="driver-age mt-1">
                <v-icon size="small" class="mr-1">mdi-human-male-height</v-icon>
                Возраст: {{ calculateAge(driver.birthDate) }} лет
              </div>
            </v-card-text>
            <v-card-actions class="pa-4 pt-0">
              <v-spacer></v-spacer>
              <v-btn icon variant="text" @click="editDriver(driver)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon variant="text" @click="deleteDriver(driver.id, driver.fullName)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="drivers-page__empty">
      <v-icon size="48" color="gray">mdi-account-alert</v-icon>
      <p class="mt-2">Нет водителей. Добавьте первого.</p>
    </div>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Редактировать водителя' : 'Новый водитель' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.fullName"
            label="ФИО"
            required
            :rules="[v => !!v || 'Введите ФИО']"
          />
          <v-text-field
            v-model="form.birthDate"
            label="Дата рождения"
            type="date"
            required
            :rules="[v => !!v || 'Укажите дату рождения']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="saveDriver">Сохранить</v-btn>
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
        <v-card-text>Вы уверены, что хотите удалить водителя <strong>{{ confirmDialog.driverName }}</strong>?</v-card-text>
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
  import { useDriverStore } from '../stores/useDriverStore'

  const driverStore = useDriverStore()

  const dialog = ref(false)
  const isEdit = ref(false)
  const form = ref({
    fullName: '',
    birthDate: '',
  })
  const snackbar = ref({ show: false, text: '', color: 'error' })
  const confirmDialog = ref({
    show: false,
    driverId: null,
    driverName: ''
  })

  const openAddDialog = () => {
    isEdit.value = false
    form.value = {
      fullName: '',
      birthDate: '',
    }
    dialog.value = true
  }

  const editDriver = (driver) => {
    isEdit.value = true
    form.value = { ...driver }
    dialog.value = true
  }

  const saveDriver = () => {
    if (!form.value.fullName || !form.value.birthDate) {
      snackbar.value = { show: true, text: 'Заполните все поля', color: 'error' }
      return
    }
    if (isEdit.value) {
      driverStore.updateDriver(form.value.id, form.value)
    } else {
      driverStore.addDriver(form.value)
    }
    dialog.value = false
  }

  const deleteDriver = (id, fullName) => {
    confirmDialog.value = {
      show: true,
      driverId: id,
      driverName: fullName
    }
  }

  const confirmDelete = () => {
    driverStore.deleteDriver(confirmDialog.value.driverId)
    confirmDialog.value.show = false
  }

  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return '—'
    const birthDate = new Date(birthDateStr)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }
</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .drivers-page {
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
      .driver-name {
        font-weight: 600;
        font-size: 1.1rem;
        word-break: break-word;
      }
      .driver-birth, .driver-age {
        display: flex;
        align-items: center;
        font-size: 0.9rem;
      }
    }

    &__empty {
      text-align: center;
      padding: var(--spacing-12) 0;
      color: gray;
    }
  }
</style>
