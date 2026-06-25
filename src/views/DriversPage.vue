<template>
  <div class="drivers-page">
    <div class="drivers-page__toolbar">
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
        :disabled="!selectedDriver"
        @click="openEditDialog"
      >
        Редактировать
      </v-btn>
      <v-btn
        color="error"
        variant="outlined"
        prepend-icon="mdi-delete"
        :disabled="!selectedDriver"
        @click="openDeleteConfirm"
      >
        Удалить
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
          :data-id="item.id"
          :tabindex="0"
          :class="selectedDriver?.id === item.id ? 'selected-row' : ''"
          @click="onRowClick(item)"
          @keydown="onRowKeydown($event, item)"
          style="cursor: pointer;"
        >
          <td>{{ item.lastName }}</td>
          <td>{{ item.firstName }}</td>
          <td>{{ item.patronymic }}</td>
          <td>{{ formatDisplayDate(item.birthDate) }}</td>
          <td>{{ item.age }}</td>
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
            @input="onDateInput"
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
  import { ref, onMounted } from 'vue'
  import { useDriverStore } from '../stores/useDriverStore'
  import ConfirmDialog from '../components/common/ConfirmDialog.vue'
  import { formatDisplayDate, parseDateFromDisplay, validateDateRange, applyDateMask } from '@/utils/date'
  import { useTableKeyboard } from '../composables/useTableKeyboard'

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

  onMounted(() => {
    driverStore.fetchDrivers()
  })

  const requiredRule = (v) => !!v || 'Укажите дату рождения'

  const dateRangeRule = (v) => {
    const result = validateDateRange(v)
    if (result === true) return true
    return result
  }

  const onDateInput = (event) => {
    displayBirthDate.value = applyDateMask(event)
  }

  const formatFullName = (driver) => {
    return driverStore.formatFullName(driver)
  }

  const onRowClick = (item) => {
    if (selectedDriver.value?.id === item.id) {
      selectedDriver.value = null
    } else {
      selectedDriver.value = { ...item }
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

  const saveDriver = async () => {
    if (!form.value.lastName || !form.value.firstName || !displayBirthDate.value) {
      snackbar.value = { show: true, text: 'Заполните обязательные поля (Фамилия, Имя, Дата рождения)', color: 'error' }
      return
    }

    const parsed = parseDateFromDisplay(displayBirthDate.value)
    if (!parsed) {
      snackbar.value = { show: true, text: 'Некорректная дата (формат ДД.ММ.ГГГГ)', color: 'error' }
      return
    }

    const { day, month, year } = parsed
    const isoDate = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const rangeCheck = validateDateRange(displayBirthDate.value)
    if (rangeCheck !== true) {
      snackbar.value = { show: true, text: rangeCheck, color: 'error' }
      return
    }

    const driverData = {
      lastName: form.value.lastName,
      firstName: form.value.firstName,
      patronymic: form.value.patronymic || '',
      birthDate: isoDate,
    }

    try {
      if (isEdit.value) {
        await driverStore.updateDriver(form.value.id, driverData)
        snackbar.value = { show: true, text: 'Водитель обновлён', color: 'success' }
      } else {
        await driverStore.addDriver(driverData)
        snackbar.value = { show: true, text: 'Водитель добавлен', color: 'success' }
      }
      dialog.value = false
      await driverStore.fetchDrivers()
    } catch (error) {
      snackbar.value = { show: true, text: error.response?.data || 'Ошибка сохранения', color: 'error' }
    }
  }

  const openDeleteConfirm = () => {
    if (!selectedDriver.value) return

    confirmDialog.value = {
      show: true,
      driverId: selectedDriver.value.id,
      driverName: formatFullName(selectedDriver.value)
    }
  }

  const confirmDelete = async () => {
    const id = confirmDialog.value.driverId
    try {
      await driverStore.deleteDriver(id)
      if (selectedDriver.value && selectedDriver.value.id === id) {
        selectedDriver.value = null
      }
      confirmDialog.value.show = false
      snackbar.value = { show: true, text: 'Водитель удалён', color: 'success' }
      await driverStore.fetchDrivers()
    } catch (error) {
      snackbar.value = { show: true, text: error.response?.data || 'Ошибка удаления', color: 'error' }
    }
  }

  const { onRowKeydown } = useTableKeyboard({
    selectedItem: selectedDriver,
    onSelect: onRowClick,
    onDelete: openDeleteConfirm,
    tableSelector: '.drivers-table',
  })
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
