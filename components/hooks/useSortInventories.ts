import { useMemo } from 'react'

export default function useSortInventories(selected: any, inventories: any) {
  return useMemo(() => {
    if (!selected) return inventories
    return [].concat(inventories).sort((invA, invB) => {
      const invAMatches = invA.inventory.some((i) => i && i.inventory.some(({ id }) => id === selected))
      const invBMatches = invB.inventory.some((i) => i && i.inventory.some(({ id }) => id === selected))
      return invAMatches ? -1 : invBMatches ? 1 : 0
    })
  }, [selected, inventories])
}
