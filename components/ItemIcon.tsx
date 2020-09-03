import Tippy from "@tippyjs/react";
import { memo, useMemo } from "react";
import ExclamatonIcon from "../components/icons/ExclamationIcon";

const descStyles = {
  "@flavour": "color:blue;",
  "@warning": "color:orange;",
  "@abilitytype": "color:red;",
};
const rarityColors = {
  Junk: "#AAA",
  Basic: "#FFFFFF",
  Fine: "#62A4DA",
  Masterwork: "#1a9306",
  Rare: "#fcd00b",
  Exotic: "#ffa405",
  Ascended: "#fb3e8d",
  Legendary: "#4C139D",
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

export const styles = {
  icon: {
    display: "inline-block",
    height: 50,
    width: 50,
    border: "2px solid #4D3E34",
    backgroundColor: "#71675A",
    margin: 2,
  },
  dup: {
    border: "2px solid #B33951",
  },
  selected: {
    border: "2px solid #E3D081",
  },
  notSelected: {
    filter: "grayscale(1)",
  },
};

interface Props {
  item: any;
  selected: number;
  setSelected: any;
  dupItems: any;
  inventories: any;
  onlyDuplicates: boolean;
}

function useDupLocations (isDup: boolean, inventories: any, id?: number) {
  return useMemo(() => {
    if (!isDup || !id) return [];
    return (inventories || []).filter(({inventory}) => inventory && inventory.some((i) => i && i.inventory.some(({id: invId}) => invId === id)));
  }, [isDup, inventories, id])
}

function ItemIcon({ item: b, setSelected, selected, dupItems, inventories, onlyDuplicates }: Props) {
  const isDup = b && dupItems.has(b.id) && (!b.count || b.count < 250);
  const dupLocations = useDupLocations(isDup, inventories, b && b.id);
  if (!isDup && onlyDuplicates || (isDup && onlyDuplicates && (!b || !b.icon))) return null;
  return b && b.icon ? (
    <Tippy
      placement="bottom-start"
      animation={false}
      content={
        <div
          style={{
            backgroundColor: "rgba(37,48, 43, 0.8)",
            border: "1px solid #000000",
            color: "#FFFFFF",
            padding: 10,
          }}
        >
          <div
            style={{
              color: rarityColors[b.rarity] || "#FFFFFF",
              fontWeight: "bold",
              marginBottom: "0.5em",
            }}
          >
            {b.count} {b.name}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: cleanDescription(b.description),
            }}
          />
          {isDup && dupLocations.length > 0 ? <div style={{marginTop: "0.5em"}}>
            Duplicated in:
            <ul style={{margin: 3}}>
              {dupLocations.map(({character}) => <li key={character.name} style={{margin: 0}}>{character.name}'s Inventory</li>)}
            </ul>
          </div> : null}
          {(b.flags || []).includes("AccountBound") ? (
            <div style={{ marginTop: "0.5em" }}>Account Bound</div>
          ) : null}
          {b.charges ? (
            <div style={{ marginTop: "0.5em" }}>{b.charges} charges</div>
          ) : null}
          {b.bound_to ? (
            <div style={{ marginTop: "0.5em" }}>Bound to: {b.bound_to}</div>
          ) : null}
        </div>
      }
      disabled={!b.name}
    >
      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          src={b.icon}
          onClick={() => setSelected(selected === b.id ? undefined : b.id)}
          style={{
            ...styles.icon,
            ...(isDup ? styles.dup : {}),
            ...(selected === b.id ? styles.selected : {}),
            ...{ cursor: "pointer" },
            ...(selected && selected !== b.id ? styles.notSelected : {}),
          }}
        />
        {isDup ? (
          <ExclamatonIcon
            style={{
              position: "absolute",
              right: 5,
              bottom: 10,
              width: 20,
              height: 20,
              pointerEvents: "none",
            }}
            fill={"#B33951"}
          />
        ) : null}
      </div>
    </Tippy>
  ) : (
    <div style={styles.icon} />
  );
}

export default memo(ItemIcon);
