import Head from "next/head";
import { useEffect, useState } from "react";
import client from "gw2api-client";
import Tippy from "@tippyjs/react";

const BANK_SIZE = 30;
const INVENTORY_WIDTH = 5;

function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

const descStyles = {
  "@flavour": "color:blue;",
  "@warning": "color:orange;",
  "@abilitytype": "color:red;",
};
function cleanDescription(desc: string) {
  return (desc || "")
    .replace(/<br>/g, "\n")
    .replace(
      /<c=?(.*?)>(.+?)<\/c>/,
      (_, attr, content) =>
        `<span style="${
          descStyles[attr.toLowerCase()] || ""
        }">${content}</span>`
    );
}

const styles = {
  icon: {
    display: "inline-block",
    height: 50,
    width: 50,
    border: "2px solid #4D3E34",
    backgroundColor: "#71675A",
    margin: 2,
  },
  dup: {
    border: "2px solid red",
  },
  selected: {
    border: "2px solid yellow",
  }
};

/**
 * TODO: Track where the dups are for easier stacking
 */

export default function Index() {
  const [bank, setBank] = useState([]);
  const [expandedInventories, setExpandedInventories] = useState([]);
  const [dupItems, setDupItems] = useState(new Set());
  const [apiKey, setApiKey] = useState(
    "1FA14943-5E06-9940-A722-9D2A37F447656AD539B5-1260-4AA2-88EF-ABE41626B623"
  );
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState();
  useEffect(() => {
    (async () => {
      setLoading(true);
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
              return item && item.count < 250 && item.binding !== "Character"
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
                if (item && (item.charges || item.count >= 250)) {
                  return undefined;
                }
                return count > 1 ? parseInt(id) : undefined;
              })
              .filter(Boolean)
          )
        );
        setExpandedInventories(expandedInventory);
        setBank(expandedBank);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiKey]);
  return (
    <div>
      <style jsx global>{`
        body {
          background-color: #262523;
          color: #ffffff;
          font-family: Arial, sans-serif;
        }

        img {
          border: none;
        }
      `}</style>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>
          Dedup-o-tron | Find duplicates across your inventories and bank tabs
          that you could stack.
        </title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>
      <text y=%22.9em%22 font-size=%2290%22>
        🤖
      </text>
    </svg>"
        ></link>
      </Head>
      <div
        style={{
          maxWidth: 590,
          margin: "20px auto 30px auto",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src="/imgs/golem.png" style={{ height: "15vh", width: "auto" }} />
        <div style={{ margin: 20 }}>
          <div style={{ fontSize: "2.5em", marginBottom: 10 }}>
            Dedup-o-tron
          </div>
          <div>
            Find duplicates across your inventories and bank tabs that you could
            stack.
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 590, margin: "20px auto" }}>
        <input
          type="text"
          style={{
            backgroundColor: "#71675A",
            width: "100%",
            border: "none",
            outline: "none",
            color: "#FFFFFF",
            padding: 10,
            boxSizing: "border-box",
            fontSize: "1.5em",
            textOverflow: "ellipsis",
          }}
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      {loading ? (
        <div style={{ color: "#FFFFFF", textAlign: "center" }}>Loading...</div>
      ) : null}
      <div style={{ maxWidth: 590, margin: "0 auto", fontSize: "2em" }}>Bank</div>
      {chunk(bank, BANK_SIZE).map((bankTab, i) => (
        <div
          key={`bank-tab-${i}`}
          style={{ maxWidth: 590, margin: "10px auto", textAlign: "center" }}
        >
          {bankTab.map((b, j) =>
            b && b.icon ? (
              <Tippy
                key={j}
                placement="bottom-start"
                content={
                  <div
                    style={{
                      backgroundColor: "#000000",
                      color: "#FFFFFF",
                      padding: 10,
                    }}
                  >
                    <div>
                      {b.count} {b.name}
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: cleanDescription(b.description),
                      }}
                    />
                    {b.bound_to ? <div>Bound to: {b.bound_to}</div> : null}
                  </div>
                }
                disabled={!b.name}
              >
                <img
                  src={b.icon}
                  onClick={() => setSelected(b.id)}
                  style={{
                    ...styles.icon,
                    ...(dupItems.has(b.id) ? styles.dup : {}),
                    ...(selected === b.id ? styles.selected : {})
                  }}
                />
              </Tippy>
            ) : (
              <div style={styles.icon} key={`empty-${i}-${j}`} />
            )
          )}
        </div>
      ))}
      <div style={{ maxWidth: 590, margin: "0 auto", fontSize: "2em" }}>Inventories</div>
      <div>
        {expandedInventories.map(({ character, inventory }) => (
          <div
            key={character.name}
            style={{
              width:
                INVENTORY_WIDTH * styles.icon.width + INVENTORY_WIDTH * 2 * 4,
              margin: "0 auto",
            }}
          >
            {character.name}
            {inventory.map((bag, idx) =>
              bag ? (
                <div key={`${character.name}${bag.id}${idx}`}>
                  {bag
                    ? bag.inventory.map((i, idx2) => (
                        <Tippy
                          key={idx2}
                          placement="bottom-start"
                          content={
                            <div
                              style={{
                                backgroundColor: "#000000",
                                color: "#FFFFFF",
                                padding: 10,
                              }}
                            >
                              <div>
                                {i.count} {i.name}
                              </div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: cleanDescription(i.description),
                                }}
                              />
                              {i.bound_to ? (
                                <div>Bound to: {i.bound_to}</div>
                              ) : null}
                            </div>
                          }
                          disabled={!i.name}
                        >
                          {i && i.icon ? (
                            <img
                              src={i.icon}
                              onClick={() => setSelected(i.id)}
                              style={{
                                ...styles.icon,
                                ...(dupItems.has(i.id) ? styles.dup : {}),
                                ...(selected === i.id ? styles.selected : {})
                              }}
                            />
                          ) : (
                            <div
                              style={styles.icon}
                              key={`${character.name}-empty-${i}`}
                            />
                          )}
                        </Tippy>
                      ))
                    : null}
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
