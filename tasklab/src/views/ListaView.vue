<script setup>
import { storeToRefs } from 'pinia'
import { useTarefasStore } from '../stores/tarefas'
import BasePanel from '../components/BasePanel.vue'
import TaskForm from '../components/TaskForm.vue'
import ComandosIA from '../components/ComandosIA.vue'
import FiltrosTarefas from '../components/FiltrosTarefas.vue'
import ListaTarefas from '../components/ListaTarefas.vue'

const store = useTarefasStore()
const { totalPendentes } = storeToRefs(store)
</script>

<template>
  <BasePanel titulo="Tarefas">
    <p role="status">{{ totalPendentes }} pendentes</p>
    <TaskForm @adicionar="store.adicionar" />
    <ComandosIA />
    <FiltrosTarefas />
    <button type="button" @click="store.limparConcluidas">Limpar concluídas</button>
    <ListaTarefas />
  </BasePanel>
</template>
