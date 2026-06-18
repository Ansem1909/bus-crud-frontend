<template>
  <div class="drivers-page">
    <div class="drivers-page__toolbar">
      <v-btn color="primary" @click="openAddDialog">
        <v-icon left>mdi-plus</v-icon> Добавить
      </v-btn>
      <v-btn
        color="primary"
        variant="outlined"
        :disabled="!selectedDriver"
        @click="openEditDialog"
      >
        <v-icon left>mdi-pencil</v-icon> Редактировать
      </v-btn>
      <v-btn
        color="error"
        variant="outlined"
        :disabled="!selectedDriver"
        @click="openDeleteConfirm"
      >
        <v-icon left>mdi-delete</v-icon> Удалить
      </v-btn>

    </div>

    <v-data-table
      :headers="headers"
      :items="driverStore.drivers"
      item-value="id"
      class="drivers-table"
    >
      <template v-slot:item="{ item }">
        <tr
          :key="item.id"
          :class="selectedDriver && selectedDriver.id === item.id ? 'selected-row' : ''"
          @click="onRowClick(item)"
          style="cursor: pointer;"
        >
          <td>{{ item.lastName }}</td>
          <td>{{ item.firstName }}</td>
          <td>{{ item.patronymic }}</td>
          <td>{{ formatDisplayDate(item.birthDate) }}</td>
          <td>{{ calculateAge(item.birthDate) }}</td>
        </tr>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'Редактировать водителя' : 'Новый водитель' }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.lastName"
            label="Фамилия"
            required
            :rules="[v => !!v || 'Введите фамилию']"
          />
          <v-text-field
            v-model="form.firstName"
            label="Имя"
            required
            :rules="[v => !!v || 'Введите имя']"
          />
          <v-text-field
            v-model="form.patronymic"
            label="Отчество"
          />
          <v-text-field
            v-model="displayBirthDate"
            label="Дата рождения"
            placeholder="ДД.ММ.ГГГГ"
            required
            :rules="[requiredRule, dateRangeRule]"
            maxlength="10"
            @input="applyDateMask"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog">Отмена</v-btn>
          <v-btn color="primary" @click="saveDriver">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model:show="confirmDialog.show"
      :message="`Удалить водителя ${confirmDialog.driverName}?`"
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
  import { useDriverStore } from '../stores/useDriverStore'
  import ConfirmDialog from '../components/common/ConfirmDialog.vue'
  import dayjs from 'dayjs'

  const driverStore = useDriverStore()

  const selectedDriver = ref(null)
  const dialog = ref(false)
  const isEdit = ref(false)
  const form = ref({
    lastName: '',
    firstName: '',
    patronymic: '',
    birthDate: '',
  })

  const displayBirthDate = ref('')
  const snackbar = ref({ show: false, text: '', color: 'error' })
  const confirmDialog = ref({
    show: false,
    driverId: null,
    driverName: ''
  })

  const headers = [
    { title: 'Фамилия', key: 'lastName', sortable: true },
    { title: 'Имя', key: 'firstName', sortable: true },
    { title: 'Отчество', key: 'patronymic', sortable: true },
    { title: 'Дата рождения', key: 'birthDate', sortable: true },
    { title: 'Возраст', key: 'age', sortable: false },
  ]

  function isValidDate(day, month, year) {
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  }

  function parseDateFromDisplay(str) {
    if (!str) return null
    const parts = str.split('.')
    if (parts.length !== 3) return null
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const year = parseInt(parts[2], 10)
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null
    if (!isValidDate(day, month, year)) return null
    return { day, month, year }
  }

  const requiredRule = (v) => !!v || 'Укажите дату рождения'

  const dateRangeRule = (v) => {
    if (!v) return true
    const parsed = parseDateFromDisplay(v)
    if (!parsed) return 'Некорректная дата (формат ДД.ММ.ГГГГ)'
    const { day, month, year } = parsed
    const dateObj = new Date(year, month - 1, day)
    const minDate = new Date(1900, 0, 1)
    const maxDate = new Date(2026, 11, 31)
    if (dateObj < minDate || dateObj > maxDate) {
      return 'Дата должна быть между 01.01.1900 и 31.12.2026'
    }
    return true
  }

  const applyDateMask = (event) => {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length > 8) value = value.slice(0, 8)
    let formatted = ''
    for (let i = 0; i < value.length; i++) {
      if (i === 2 || i === 4) formatted += '.'
      formatted += value[i]
    }
    displayBirthDate.value = formatted
  }

  function formatDisplayDate(isoDate) {
    if (!isoDate) return '—'
    return dayjs(isoDate).format('DD.MM.YYYY')
  }

  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return '—'
    const birth = dayjs(birthDateStr)
    const now = dayjs()
    return now.diff(birth, 'year')
  }

  const formatFullName = (driver) => {
    return driverStore.formatFullName(driver)
  }

  const onRowClick = (item) => {
    if (selectedDriver.value && selectedDriver.value.id === item.id) {
      selectedDriver.value = null
    } else {
      selectedDriver.value = item
    }
  }

  const openAddDialog = () => {
    isEdit.value = false

    form.value = {
      lastName: '',
      firstName: '',
      patronymic: '',
      birthDate: '',
    }

    displayBirthDate.value = ''
    selectedDriver.value = null
    dialog.value = true
  }

  const openEditDialog = () => {
    if (!selectedDriver.value) return

    isEdit.value = true

    form.value = {
      id: selectedDriver.value.id,
      lastName: selectedDriver.value.lastName || '',
      firstName: selectedDriver.value.firstName || '',
      patronymic: selectedDriver.value.patronymic || '',
      birthDate: selectedDriver.value.birthDate || '',
    }

    displayBirthDate.value = formatDisplayDate(selectedDriver.value.birthDate)
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
  }

  const saveDriver = () => {
    if (!form.value.lastName || !form.value.firstName || !displayBirthDate.value) {
      snackbar.value = {
        show: true,
        text: 'Заполните обязательные поля (Фамилия, Имя, Дата рождения)',
        color: 'error'
      }
      return
    }

    const parsed = parseDateFromDisplay(displayBirthDate.value)
    if (!parsed) {
      snackbar.value = {
        show: true,
        text: 'Некорректная дата (формат ДД.ММ.ГГГГ)',
        color: 'error'
      }
      return
    }

    const { day, month, year } = parsed
    const dateObj = new Date(year, month - 1, day)
    const minDate = new Date(1900, 0, 1)
    const maxDate = new Date(2026, 11, 31)

    if (dateObj < minDate || dateObj > maxDate) {
      snackbar.value = {
        show: true,
        text: 'Дата должна быть между 01.01.1900 и 31.12.2026',
        color: 'error'
      }
      return
    }

    const isoDate = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const driverData = {
      lastName: form.value.lastName,
      firstName: form.value.firstName,
      patronymic: form.value.patronymic || '',
      birthDate: isoDate,
    }

    if (isEdit.value) {
      driverStore.updateDriver(form.value.id, driverData)
      const updatedDriver = driverStore.drivers.find(d => d.id === form.value.id)
      selectedDriver.value = updatedDriver || null
      snackbar.value = { show: true, text: 'Водитель обновлён', color: 'success' }
    } else {
      driverStore.addDriver(driverData)
      const addedDriver = driverStore.drivers[driverStore.drivers.length - 1]
      selectedDriver.value = addedDriver
      snackbar.value = { show: true, text: 'Водитель добавлен', color: 'success' }
    }
    dialog.value = false
  }

  const openDeleteConfirm = () => {
    if (!selectedDriver.value) return
    confirmDialog.value = {
      show: true,
      driverId: selectedDriver.value.id,
      driverName: formatFullName(selectedDriver.value)
    }
  }

  const confirmDelete = () => {
    const id = confirmDialog.value.driverId
    driverStore.deleteDriver(id)
    if (selectedDriver.value && selectedDriver.value.id === id) {
      selectedDriver.value = null
    }
    confirmDialog.value.show = false
    snackbar.value = { show: true, text: 'Водитель удалён', color: 'success' }
  }
</script>

<style lang="scss" scoped>
  @use '../assets/styles/helpers' as *;
  @use '../assets/styles/settings' as *;

  .drivers-page {
    &__toolbar {
      display: flex;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-6);
      flex-wrap: wrap;
    }

    .drivers-table {
      background: var(--color-surface);

      :deep(tr) {
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: color-mix(in srgb, var(--color-text-primary) 10%, transparent);;
        }

      }

      :deep(.selected-row) {
        background-color: color-mix(in srgb, var(--color-text-primary) 15%, transparent);
        border-left: 4px solid var(--color-primary);

        &:hover {
          background-color: color-mix(in srgb, var(--color-text-primary) 25%, transparent);
        }
      }


    }
  }
</style>
