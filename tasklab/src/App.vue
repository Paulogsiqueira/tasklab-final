<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTarefasStore } from './stores/tarefas'

const store = useTarefasStore()
const { estado, erro, totalPendentes, totalConcluidas } = storeToRefs(store)

onMounted(() => store.carregar())
</script>

<template>
  <header class="topo">
    <h1>TaskLab</h1>
    <nav aria-label="Principal">
      <RouterLink :to="{ name: 'lista' }">Lista</RouterLink>
      <RouterLink :to="{ name: 'resumo' }">
        Resumo ({{ totalPendentes }} pendentes · {{ totalConcluidas }} concluídas)
      </RouterLink>
    </nav>
  </header>

  <main>
    <p v-if="estado === 'ocioso'" role="status">Preparando o TaskLab…</p>
    <p v-else-if="estado === 'carregando'" role="status">Carregando tarefas…</p>
    <div v-else-if="estado === 'erro'" role="alert">
      <p>{{ erro }}</p>
      <button type="button" @click="store.carregar()">Tentar de novo</button>
    </div>
    <RouterView v-else />
  </main>
</template>
