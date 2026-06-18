<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title>Подтверждение удаления</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="dialog = false">Отмена</v-btn>
        <v-btn color="error" @click="confirm">Удалить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  message: String,
})

const emit = defineEmits(['update:show', 'confirmed'])

const dialog = ref(false)

watch(() => props.show, (val) => {
  dialog.value = val
})

watch(dialog, (val) => {
  if (!val) emit('update:show', false)
})

const confirm = () => {
  emit('confirmed')
  dialog.value = false
}
</script>
