<script setup>
import { onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTarefasStore } from '../stores/tarefas'

const props = defineProps({ titulo: { type: String, required: true } })

const store = useTarefasStore()
const { sugestoes, iaCarregando, iaErro } = storeToRefs(store)

// título mudou -> sugestões antigas não valem mais
watch(() => props.titulo, () => store.limparSugestoes())
// cancela req pendente ao sair
onUnmounted(() => store.limparSugestoes())
</script>

<template>
  <section aria-labelledby="titulo-passos">
    <h3 id="titulo-passos">Passos com IA</h3>
    <button type="button" @click="store.sugerirPassos(titulo)">Quebrar em passos</button>

    <p v-if="iaCarregando" role="status">Pensando…</p>
    <p v-else-if="iaErro" role="alert">{{ iaErro }}</p>
    <ul v-else-if="sugestoes.length">
      <!-- sem v-html, texto vem da IA -->
      <li v-for="passo in sugestoes" :key="passo" class="item">
        <span>{{ passo }}</span>
        <button type="button" @click="store.aceitarSugestao(passo)">Adicionar</button>
      </li>
    </ul>
    <button v-if="sugestoes.length" type="button" @click="store.aceitarTodas">
      Adicionar todos
    </button>
  </section>
</template>
