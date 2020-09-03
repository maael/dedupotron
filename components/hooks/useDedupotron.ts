import { useEffect, useState } from "react";
import client from "gw2api-client";
import useLocalstorage, { LocalStorageKeys } from './useLocalstorage';

/**
 * TODO: Track where the dups are for easier stacking
 */

export default function useDedupotron (highlightGear: boolean) {
  const [bank, setBank] = useState([]);
  const [expandedInventories, setExpandedInventories] = useState([]);
  const [dupItems, setDupItems] = useState(new Set());
  const [apiKey, setApiKey] = useLocalstorage(LocalStorageKeys.API_KEY, '');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState();
  const [error, setError] = useState<string>();
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const api = client().authenticate(apiKey);
        const localItemCountMap = {};
        const bank = await api.account().bank().get();
        const allItemIds = bank
          .map((item) => {
            return item ? item.id : null;
          })
          .filter(Boolean);
        const checkedItemIds = bank
          .map((item) => {
            return item && item.count < 250 && item.binding !== "Character"
              ? item.id
              : null;
          })
          .filter(Boolean);
        checkedItemIds.forEach((id) => {
          localItemCountMap[id] = (localItemCountMap[id] || 0) + 1;
        });
        const items = await api.items().many(allItemIds);
        const itemMap = new Map<string, any>(
          items.map((item) => [item.id, item])
        );
        const expandedBank = bank.map((item) => ({
          ...item,
          ...(item && itemMap.has(item.id) ? itemMap.get(item.id) : {}),
        }));
        const characters = await api.characters().all();
        const inventories = await Promise.all(
          characters.map(async (c) => ({
            inventory: await api.characters(c.name).inventory().get(),
            character: c,
          }))
        );
        const allInventoryItemIds = inventories
          .flatMap(({ inventory }) => inventory)
          .filter(Boolean)
          .flatMap(({ inventory }) =>
            inventory.map((item) => {
              return item ? item.id : null;
            })
          )
          .filter(Boolean);
        const checkedInventoryItemIds = inventories
          .flatMap(({ inventory }) => inventory)
          .filter(Boolean)
          .flatMap(({ inventory }) =>
            inventory.map((item) => {
              return item && item.count <= 250 && item.binding !== "Character"
                ? item.id
                : null;
            })
          )
          .filter(Boolean);
        checkedInventoryItemIds.forEach((id) => {
          localItemCountMap[id] = (localItemCountMap[id] || 0) + 1;
        });
        const inventoryItems = await api.items().many(allInventoryItemIds);
        const inventoryItemMap = new Map<string, object>(
          inventoryItems.map((item) => [item.id, item])
        );
        const expandedInventory = inventories.map((i: any) => ({
          ...i,
          inventory: i.inventory.map((i2: any) =>
            i2
              ? {
                  ...i2,
                  inventory: i2.inventory.map((item) => ({
                    ...item,
                    ...(item && inventoryItemMap.has(item.id)
                      ? inventoryItemMap.get(item.id)
                      : {}),
                  })),
                }
              : i2
          ),
        }));
        setDupItems(
          new Set(
            Object.entries(localItemCountMap)
              .map(([id, count]) => {
                const item =
                  itemMap.get(parseInt(id, 10) as any) ||
                  inventoryItemMap.get(parseInt(id, 10) as any);
                if (item && (item.charges || item.count >= 250 || item.type === 'Bag' || item.type === 'Gathering' || (item.details && item.details.type === 'Salvage'))) {
                  return undefined;
                }
                if (!highlightGear && item && ['Weapon', 'Back', 'Armor', 'Trinket'].includes(item.type)) {
                  return undefined;
                }
                return count > 1 ? parseInt(id) : undefined;
              })
              .filter(Boolean)
          )
        );
        setExpandedInventories(expandedInventory);
        setBank(expandedBank);
      } catch (e) {
        console.error(e);
        setError(!apiKey ? 'Please provide an API key.' : 'An unexpected error occurred.')
      } finally {
        setLoading(false);
      }
    })();
  }, [apiKey, highlightGear]);
  return {loading, error, bank, expandedInventories, dupItems, selected, apiKey, setSelected, setApiKey};
}