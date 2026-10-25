import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filtroValido } from '../utils/filtros'

// filtros ficam na query (?busca=...&filtro=...)
export function useFiltrosUrl() {
  const route = useRoute()
  const router = useRouter()

  const busca = computed(() => (typeof route.query.busca === 'string' ? route.query.busca : ''))
  const filtro = computed(() => filtroValido(route.query.filtro))

  function aplicar(novos, { empurrar = false } = {}) {
    const query = { ...route.query, ...novos }
    if (!query.busca) delete query.busca
    if (!query.filtro || query.filtro === 'todas') delete query.filtro
    // replace ao digitar p/ não poluir o histórico, push qdo vem da IA
    const navegar = empurrar ? router.push : router.replace
    navegar.call(router, { query })
  }

  return { busca, filtro, aplicar }
}
