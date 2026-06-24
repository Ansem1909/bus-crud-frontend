<template>
  <v-dialog v-model="show" max-width="400">
    <v-card>
      <v-card-title>
        Подтверждение удаления
      </v-card-title>

      <v-card-text>
        {{ message }}
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn @click="show = false">
          Отмена
        </v-btn>

        <v-btn color="error" @click="confirm">
          Удалить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  defineProps({
    message: String
  })

  const show = defineModel('show')

  const emit = defineEmits(['confirmed'])

  const confirm = () => {
    emit('confirmed')
  }

</script>
