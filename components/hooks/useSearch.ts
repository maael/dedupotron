import { useMemo } from 'react'
import { GuildItem } from './useGuilds'

export default function useSearch(bank: any, inventories: any, guildStashes: GuildItem[], search: string) {
  return useMemo(() => {
    if (search.trim() === '') return [bank, inventories, guildStashes]
    const filteredBank = bank.filter(({ name }) => name && name.toLowerCase().includes(search.toLowerCase()))
    const filteredInventories = inventories.map((inv) => {
      return Object.assign({}, inv, {
        inventory: inv.inventory.map((bag) => {
          if (!bag || !bag.inventory) return bag
          return Object.assign({}, bag, {
            inventory: bag.inventory.filter(({ name }) => name && name.toLowerCase().includes(search.toLowerCase())),
          })
        }),
      })
    })
    const filteredGuildStashes = guildStashes.map((g) => {
      return Object.assign({}, g, {
        stash: g.stash.map((s) => {
          if (!s || !s.inventory) return s
          return Object.assign({}, s, {
            inventory: s.inventory.filter(
              (item) => item && item.name && item.name.toLowerCase().includes(search.toLowerCase())
            ),
          })
        }),
      })
    })
    return [filteredBank, filteredInventories, filteredGuildStashes]
  }, [bank, inventories, guildStashes, search])
}
