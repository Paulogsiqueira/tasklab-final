<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTarefasStore } from '../stores/tarefas'
import TaskItem from './TaskItem.vue'
import { useFiltrosUrl } from '../composables/useFiltrosUrl'
import { aplicarFiltro } from '../utils/filtros'

const store = useTarefasStore()
const { tarefas } = storeToRefs(store)
const { busca, filtro } = useFiltrosUrl()

// derivado, não altera a lista da store
const visiveis = computed(() => aplicarFiltro(tarefas.value, busca.value, filtro.value))
</script>

<template>
  <p v-if="tarefas.length === 0">Nenhuma tarefa cadastrada</p>
  <p v-else-if="visiveis.length === 0">Nenhuma tarefa corresponde aos filtros</p>
  <ul v-else>
    <TaskItem
      v-for="t in visiveis"
      :key="t.id"
      :tarefa="t"
      @alternar="store.alternar"
      @remover="store.remover"
    />
  </ul>
</template>
