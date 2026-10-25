import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { lerSalvas, salvar, semente } from '../utils/armazenamento'
import { pedirPassos } from '../services/ia'

export const useTarefasStore = defineStore('tarefas', () => {
  // state
  const tarefas = ref([])
  // ocioso | carregando | sucesso | erro
  const estado = ref('ocioso')
  const erro = ref('')
  const sugestoes = ref([])
  const iaCarregando = ref(false)
  const iaErro = ref('')
  let controlador = null // req de IA atual

  // getters
  const total = computed(() => tarefas.value.length)
  const pendentes = computed(() => tarefas.value.filter((t) => !t.concluida))
  const concluidas = computed(() => tarefas.value.filter((t) => t.concluida))
  const totalPendentes = computed(() => pendentes.value.length)
  const totalConcluidas = computed(() => concluidas.value.length)
  const percentualConcluido = computed(() =>
    total.value === 0 ? 0 : Math.round((totalConcluidas.value / total.value) * 100)
  )
  const carregando = computed(() => estado.value === 'carregando')
  const porId = (id) => tarefas.value.find((t) => t.id === id)

  // actions
  async function carregar() {
    estado.value = 'carregando'
    erro.value = ''
    try {
      await new Promise((resolve) => setTimeout(resolve, 400)) // simula latência
      tarefas.value = lerSalvas() ?? semente()
      estado.value = 'sucesso'
    } catch (e) {
      erro.value = e.message
      estado.value = 'erro'
    } finally {
      // não deixa preso em carregando
      if (estado.value === 'carregando') estado.value = 'erro'
    }
  }

  function adicionar(titulo) {
    const limpo = titulo.trim()
    if (!limpo) return
    const id = Math.max(0, ...tarefas.value.map((t) => t.id)) + 1
    tarefas.value.push({ id, titulo: limpo, concluida: false })
  }

  function alternar(id) {
    const tarefa = porId(id)
    if (tarefa) tarefa.concluida = !tarefa.concluida
  }

  function limparConcluidas() {
    tarefas.value = tarefas.value.filter((t) => !t.concluida)
  }

  function editar({ id, titulo }) {
    const limpo = titulo.trim()
    const tarefa = porId(id)
    if (tarefa && limpo) tarefa.titulo = limpo
  }

  function remover(id) {
    tarefas.value = tarefas.value.filter((t) => t.id !== id)
  }

  // IA
  async function sugerirPassos(titulo) {
    controlador?.abort() // cancela a anterior
    const meu = new AbortController()
    controlador = meu
    iaCarregando.value = true
    iaErro.value = ''
    sugestoes.value = []
    try {
      const passos = await pedirPassos(titulo, meu.signal)
      sugestoes.value = passos
      if (passos.length === 0) iaErro.value = 'Nenhuma sugestão válida.'
    } catch (e) {
      if (e.name !== 'AbortError') iaErro.value = 'Não foi possível sugerir passos agora.'
    } finally {
      if (controlador === meu) iaCarregando.value = false
    }
  }

  function limparSugestoes() {
    controlador?.abort()
    controlador = null
    sugestoes.value = []
    iaErro.value = ''
    iaCarregando.value = false
  }

  function aceitarSugestao(passo) {
    adicionar(passo)
    sugestoes.value = sugestoes.value.filter((p) => p !== passo)
  }

  function aceitarTodas() {
    const lista = [...sugestoes.value]
    lista.forEach((passo) => adicionar(passo)) // passa pelo adicionar p/ manter a validação
    sugestoes.value = []
  }

  // persistência
  watch(tarefas, (lista) => salvar(lista), { deep: true })

  return {
    tarefas, estado, carregando, erro, sugestoes, iaCarregando, iaErro,
    total, pendentes, concluidas, totalPendentes, totalConcluidas, percentualConcluido, porId,
    carregar, adicionar, alternar, limparConcluidas, editar, remover,
    sugerirPassos, limparSugestoes, aceitarSugestao, aceitarTodas
  }
})
