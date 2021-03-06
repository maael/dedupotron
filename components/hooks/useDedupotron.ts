import { useEffect, useState } from 'react'
import client from 'gw2api-client'
import { GuildItem } from './useGuilds'

/**
 * TODO: Track where the dups are for easier stacking
 */

export default function useDedupotron(apiKey: string, highlightGear: boolean, guildStashes: GuildItem[]) {
  const [bank, setBank] = useState([])
  const [expandedInventories, setExpandedInventories] = useState([])
  const [dupItems, setDupItems] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState()
  const [error, setError] = useState<string>()
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(undefined)
      try {
        const api = client().authenticate(apiKey)
        const localItemCountMap = {}
        const [bank, characters] = await Promise.all([api.account().bank().get(), api.characters().all()])
        const allItemIds = bank
          .map((item) => {
            return item ? item.id : null
          })
          .filter(Boolean)
        const checkedItemIds = bank
          .map((item) => {
            return item && item.count < 250 && item.binding !== 'Character' ? `${item.id}:${item.binding || ''}` : null
          })
          .filter(Boolean)
        checkedItemIds.forEach((id) => {
          localItemCountMap[id] = (localItemCountMap[id] || 0) + 1
        })
        const [items, inventories] = await Promise.all([
          api.items().many(allItemIds),
          Promise.all(
            characters.map(async (c) => ({
              inventory: await api.characters(c.name).inventory().get(),
              character: c,
            }))
          ),
        ])
        const itemMap = new Map<string, any>(items.map((item) => [item.id, item]))
        const expandedBank = bank.map((item) => ({
          ...item,
          ...(item && itemMap.has(item.id) ? itemMap.get(item.id) : {}),
        }))
        const allInventoryItemIds = inventories
          .flatMap(({ inventory }) => inventory)
          .filter(Boolean)
          .flatMap(({ inventory }) =>
            inventory.map((item) => {
              return item ? item.id : null
            })
          )
          .filter(Boolean)
        const inventoryItems = await api.items().many(allInventoryItemIds)
        const inventoryItemMap = new Map<string, object>(inventoryItems.map((item) => [item.id, item]))
        const expandedInventory = inventories.map((i: any) => ({
          ...i,
          inventory: i.inventory.map((i2: any) =>
            i2
              ? {
                  ...i2,
                  inventory: i2.inventory.map((item) => ({
                    ...item,
                    ...(item && inventoryItemMap.has(item.id) ? inventoryItemMap.get(item.id) : {}),
                  })),
                }
              : i2
          ),
        }))
        const checkedInventoryItemIds = inventories
          .flatMap(({ inventory }) => inventory)
          .concat(guildStashes.flatMap((s) => s.stash))
          .filter(Boolean)
          .flatMap(({ inventory }) =>
            inventory.map((item) => {
              return item && item.count <= 250 && item.binding !== 'Character'
                ? `${item.id}:${item.binding || ''}`
                : null
            })
          )
          .filter(Boolean)
        checkedInventoryItemIds.forEach((id) => {
          localItemCountMap[id] = (localItemCountMap[id] || 0) + 1
        })
        setDupItems(
          new Set(
            Object.entries(localItemCountMap)
              .map(([id, count]) => {
                const numericId = parseInt(id.split(':')[0], 10) as any
                const item = inventoryItemMap.get(numericId) || itemMap.get(numericId)
                if (
                  item &&
                  (item.charges ||
                    item.count >= 250 ||
                    item.type === 'Bag' ||
                    item.type === 'Gathering' ||
                    (item.details && item.details.type === 'Salvage'))
                ) {
                  return undefined
                }
                if (!highlightGear && item && ['Weapon', 'Back', 'Armor', 'Trinket'].includes(item.type)) {
                  return undefined
                }
                return count > 1 ? numericId : undefined
              })
              .filter(Boolean)
          )
        )
        setExpandedInventories(expandedInventory)
        setBank(expandedBank)
      } catch (e) {
        console.error(e)
        setError(!apiKey ? 'Please provide an API key.' : 'An unexpected error occurred.')
      } finally {
        setLoading(false)
      }
    })()
  }, [apiKey, highlightGear, guildStashes])
  return {
    loading,
    error,
    bank,
    expandedInventories,
    dupItems,
    selected,
    setSelected,
  }
}
