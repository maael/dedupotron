import { useEffect, useState } from "react";
import client from "gw2api-client";

export interface GuildStash {
  error: string | undefined;
  id: string;
  stash: {
    size: number;
    note: string;
    inventory: ({ id: number; count: number, name?: string } | null)[];
  }[];
}

export interface GuildInfo {
  name: string;
  tag: string;
  id: string;
}

export type GuildItem = GuildInfo & GuildStash;

async function getGuildsStashes(
  api: any,
  guildIds: string[]
): Promise<GuildStash[]> {
  return Promise.all(
    guildIds.map(async (id) => {
      try {
        const result = await api
          .guild(id)
          .stash()
          .get()
          .catch((err) => err.content.text || err.content);
        return typeof result === "string"
          ? { stash: [], error: result, id }
          : { stash: result, error: undefined, id };
      } catch (e) {
        console.error(e);
        return { error: e.message, stash: [], id };
      }
    })
  );
}

async function getGuildsInfo(
  api: any,
  guildIds: string[]
): Promise<GuildInfo[]> {
  return Promise.all(guildIds.map(async (id) => api.guild(id).get(id).catch((err) => err.content.text || err.content)));
}

export default function useGuilds(apiKey: string, showGuilds: boolean) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<GuildItem[]>([]);
  useEffect(() => {
    (async () => {
      if (!showGuilds) {
        setResult([]);
        return;
      }
      setLoading(true);
      setError(undefined);
      try {
        const api = client().authenticate(apiKey);
        const { guilds: guildIds } = await api.account().get();
        const [guildInfo, guilds]: [
          GuildInfo[],
          GuildStash[]
        ] = await Promise.all([
          getGuildsInfo(api, guildIds),
          getGuildsStashes(api, guildIds),
        ]);
        if (guilds.some((g) => g.error && g.error !== 'access restricted to guild leaders')) {
          throw new Error(guilds.find((g) => g.error).error);
        }
        const merged = guilds.map((g) => Object.assign<GuildStash, GuildInfo>(g, guildInfo.find((gi) => gi.id === g.id))).filter((g) => !g.error);
        const allItemIds = new Set<number>(merged.reduce((acc, m) => acc.concat(m.stash.reduce((stacc, s) => stacc.concat(s.inventory.map((item) => item && item.id)), [])), []).filter(Boolean));
        const items = new Map<number, any>((await api.items().many([...allItemIds])).map((item) => [item.id, item]));
        merged.forEach((g) => {
          g.stash.forEach((s) => {
            s.inventory = s.inventory.map((i) => i ? Object.assign(i, (items.get(i.id) || {})) : i);
          })
        })
        setResult(merged);
      } catch (e) {
        console.error("Guilds error", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiKey, showGuilds]);
  return { error, loading, result };
}
