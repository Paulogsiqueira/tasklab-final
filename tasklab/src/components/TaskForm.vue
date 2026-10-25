<script setup>
import { ref } from 'vue'

const emit = defineEmits(['adicionar'])
const titulo = ref('')
const erro = ref('')

function enviar() {
  if (!titulo.value) {
    erro.value = 'Escreva o título da tarefa.'
    return
  }
  emit('adicionar', titulo.value)
  titulo.value = ''
  erro.value = ''
}
</script>

<template>
  <form @submit.prevent="enviar" novalidate>
    <label for="titulo">Nova tarefa</label>
    <input id="titulo" v-model.trim="titulo" aria-describedby="erro-titulo" />
    <button type="submit">Adicionar</button>
    <p v-if="erro" id="erro-titulo" role="alert">{{ erro }}</p>
  </form>
</template>
