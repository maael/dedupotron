import {useMemo} from 'react';

export default function useSearch (bank: any, inventories: any, search: string) {
  return useMemo(() => {
    if (search.trim() === '') return [bank, inventories];
    const filteredBank = bank.filter(({name}) => name && name.toLowerCase().includes(search.toLowerCase()));
    const filteredInventories = inventories.map((inv) => {
      return Object.assign({}, inv, {inventory: inv.inventory.map((bag) => {
        if (!bag || !bag.inventory) return bag;
        return Object.assign({}, bag, {inventory: bag.inventory.filter(({name}) => name && name.toLowerCase().includes(search.toLowerCase()))});
      })});
    })
    return [filteredBank, filteredInventories];
  }, [bank, inventories, search]);
}