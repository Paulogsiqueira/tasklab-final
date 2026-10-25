<script setup>
import { onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTarefasStore } from '../stores/tarefas'
import { useFiltrosUrl } from '../composables/useFiltrosUrl'
import { pedirAcoes } from '../services/ia'
import { descrever } from '../utils/acoes'

const store = useTarefasStore()
const { tarefas } = storeToRefs(store)
const { aplicar } = useFiltrosUrl()

const texto = ref('')
const plano = ref([]) // plano já validado
const carregando = ref(false)
const erro = ref('')
let controlador = null

// cada ação chama a mesma action/rota da UI
const EXECUTORES = {
  adicionar: (a) => store.adicionar(a.titulo),
  alternar: (a) => store.alternar(a.id),
  editar: (a) => store.editar({ id: a.id, titulo: a.titulo }),
  filtrar: (a) => aplicar({ busca: a.busca, filtro: a.filtro }, { empurrar: true })
}

async function pedir() {
  if (!texto.value) {
    erro.value = 'Escreva o que você quer fazer.'
    return
  }
  controlador?.abort() // cancela o pedido anterior
  const meu = new AbortController()
  controlador = meu
  carregando.value = true
  erro.value = ''
  plano.value = []
  try {
    plano.value = await pedirAcoes(texto.value, tarefas.value, meu.signal)
    if (plano.value.length === 0) erro.value = 'Não encontrei nada que eu possa fazer com esse pedido.'
  } catch (e) {
    if (e.name !== 'AbortError') erro.value = 'Não consegui interpretar o pedido.'
  } finally {
    if (controlador === meu) carregando.value = false
  }
}

function executar(acao) {
  EXECUTORES[acao.acao](acao)
  plano.value = plano.value.filter((a) => a !== acao)
}

function executarTudo() {
  const lista = [...plano.value]
  lista.forEach((acao) => EXECUTORES[acao.acao](acao))
  plano.value = []
}

function descartar() {
  plano.value = []
}

onUnmounted(() => controlador?.abort())
</script>

<template>
  <section aria-labelledby="titulo-comandos">
    <h3 id="titulo-comandos">Assistente de comandos</h3>
    <form @submit.prevent="pedir" novalidate>
      <label for="comando">O que você quer fazer?</label>
      <input
        id="comando"
        v-model.trim="texto"
        placeholder="Ex.: adicione revisar o router e mostre as pendentes"
      />
      <button type="submit">Pedir</button>
    </form>

    <p v-if="carregando" role="status">Pensando…</p>
    <p v-else-if="erro" role="alert">{{ erro }}</p>
    <div v-else-if="plano.length">
      <p>A IA propôs este plano. Nada foi feito ainda:</p>
      <ul>
        <li v-for="(acao, i) in plano" :key="i" class="item">
          <span>{{ descrever(acao, tarefas) }}</span>
          <button type="button" @click="executar(acao)">Fazer</button>
        </li>
      </ul>
      <button type="button" @click="executarTudo">Fazer tudo</button>
      <button type="button" @click="descartar">Descartar</button>
    </div>
  </section>
</template>
