import Head from "next/head";
import Tippy from "@tippyjs/react";
import ExclamatonIcon from "../components/icons/ExclamationIcon";
import chunk from '../util/chunk';
import useDedupotron from '../components/hooks/useDedupotron';

const BANK_SIZE = 30;
const INVENTORY_WIDTH = 10;

const descStyles = {
  "@flavour": "color:blue;",
  "@warning": "color:orange;",
  "@abilitytype": "color:red;",
};
const rarityColors = {
  Junk: '#AAA',
  Basic: '#FFFFFF',
  Fine: '#62A4DA',
  Masterwork: '#1a9306',
  Rare: '#fcd00b',
  Exotic: '#ffa405',
  Ascended: '#fb3e8d',
  Legendary: '#4C139D'
}
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
    border: "2px solid #B33951",
  },
  selected: {
    border: "2px solid #E3D081",
  },
  notSelected: {
    filter: "grayscale(1)",
  },
};

/**
 * TODO: Track where the dups are for easier stacking
 */

export default function Index() {
  const {loading, error, bank, expandedInventories, dupItems, selected, apiKey, setSelected, setApiKey} = useDedupotron();
  return (
    <div>
      <style jsx global>{`
        body {
          background-color: #262523;
          color: #F1F7ED;
          font-family: Arial, sans-serif;
          padding-bottom: 50px;
        }

        input::placeholder {
          color: #F1F7ED;
        }

        a {
          color: #B33951;
        }

        img {
          border: none;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#B33951" />
        <title>
          Dedupe-o-tron | Find duplicates across your inventories and bank tabs
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
          margin: "20px auto 10px auto",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ margin: '20px 20px 0px 20px' }}>
          <div style={{ fontSize: "2.5em", marginBottom: 10 }}>
            🤖 Dedupe-o-tron
          </div>
          <div>
            Find duplicates across your Guild Wars 2 characters inventories and bank tabs that you can
            stack to save space.
          </div>
          <div style={{textAlign: 'center', marginTop: '0.5em'}}>
            Made by <a href='http://reddit.com/u/maael'>u/maael</a>
          </div>
          <div style={{textAlign: 'center', marginTop: '0.5em'}}>
            <a href='https://github.com/maael/dedupotron'>GitHub</a>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 590, margin: "10px auto 20px auto" }}>
        <ol>
        <li>Open the <a href="https://account.arena.net/applications">official Guild Wars 2 API Key Management</a>.</li>
        <li>Click on the "New Key" button.</li>
        <li>Enter a name of your choice and check all permission checkboxes.</li>
        <li>Copy your new API key. CTRL + C</li>
        <li>Paste it in the form above. CTRL + V</li>
        </ol>
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
          placeholder="API Key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div style={{height: '1em'}}>
      {loading ? (
        <div style={{ color: "#FFFFFF", textAlign: "center" }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#B33951", textAlign: "center" }}><ExclamatonIcon style={{height: '1em', width: '1em', display: 'inline-block', marginRight: 5, position: 'relative', top: 2}} fill={'#B33951'} />{error}</div>
      ) : null}
      </div>
      <div style={{ maxWidth: 590, margin: "0 auto", fontSize: "2em" }}>
        Bank
      </div>
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
                    backgroundColor: "rgba(37,48, 43, 0.8)",
                    border: '1px solid #000000',
                    color: "#FFFFFF",
                    padding: 10,
                  }}
                >
                  <div style={{color: rarityColors[b.rarity] || '#FFFFFF', fontWeight: 'bold', marginBottom: '0.5em'}}>
                    {b.count} {b.name}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: cleanDescription(b.description),
                    }}
                  />
                  {(b.flags || []).includes('AccountBound') ? (
                    <div style={{marginTop: '0.5em'}}>Account Bound</div>
                  ) : null}
                  {b.charges ? (
                    <div style={{marginTop: '0.5em'}}>{b.charges} charges</div>
                  ) : null}
                  {b.bound_to ? (
                    <div style={{marginTop: '0.5em'}}>Bound to: {b.bound_to}</div>
                  ) : null}
                </div>
                }
                disabled={!b.name}
              >
                <div style={{position: 'relative', display: 'inline-block'}}>
                  <img
                    src={b.icon}
                    onClick={() =>
                      setSelected(selected === b.id ? undefined : b.id)
                    }
                    style={{
                      ...styles.icon,
                      ...(dupItems.has(b.id) ? styles.dup : {}),
                      ...(selected === b.id ? styles.selected : {}),
                      ...(selected && selected !== b.id
                        ? styles.notSelected
                        : {}),
                    }}
                  />
                  {dupItems.has(b.id) ? <ExclamatonIcon style={{position: 'absolute', right: 5, bottom: 10, width: 20, height: 20}} fill={'#B33951'} /> : null}
                </div>
              </Tippy>
            ) : (
              <div style={styles.icon} key={`empty-${i}-${j}`} />
            )
          )}
        </div>
      ))}
      <div style={{ maxWidth: 590, margin: "0 auto", fontSize: "2em" }}>
        Inventories
      </div>
      <div>
        {expandedInventories.map(({ character, inventory }) => (
          <div
            key={character.name}
            style={{
              width:
                INVENTORY_WIDTH * styles.icon.width + INVENTORY_WIDTH * 2 * 4,
              maxWidth: '100%',
              margin: "0 auto",
            }}
          >
            <div style={{fontSize: '1.5em', margin: '10px 0px 5px'}}>{character.name}</div>
            {inventory.map((bag, idx) =>
              bag ? (
                <div key={`${character.name}${bag.id}${idx}`}>
                  {bag
                    ? bag.inventory.map((i, idx2) => (
                        <Tippy
                          key={idx2}
                          placement="bottom-start"
                          animation={false}
                          content={
                            <div
                              style={{
                                backgroundColor: "rgba(37,48, 43, 0.8)",
                                border: '1px solid #000000',
                                color: "#FFFFFF",
                                padding: 10,
                              }}
                            >
                              <div style={{color: rarityColors[i.rarity] || '#FFFFFF', fontWeight: 'bold', marginBottom: '0.5em'}}>
                                {i.count} {i.name}
                              </div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: cleanDescription(i.description),
                                }}
                              />
                              {(i.flags || []).includes('AccountBound') ? (
                                <div style={{marginTop: '0.5em'}}>Account Bound</div>
                              ) : null}
                              {i.charges ? (
                                <div style={{marginTop: '0.5em'}}>{i.charges} charges</div>
                              ) : null}
                              {i.bound_to ? (
                                <div style={{marginTop: '0.5em'}}>Bound to: {i.bound_to}</div>
                              ) : null}
                            </div>
                          }
                          disabled={!i.name}
                        >
                          {i && i.icon ? (
                            <div style={{position: 'relative', display: 'inline-block'}}>
                            <img
                              src={i.icon}
                              onClick={() =>
                                setSelected(
                                  selected === i.id ? undefined : i.id
                                )
                              }
                              style={{
                                ...styles.icon,
                                ...(dupItems.has(i.id) ? styles.dup : {}),
                                ...(selected === i.id ? styles.selected : {}),
                                ...(selected && selected !== i.id
                                  ? styles.notSelected
                                  : {}),
                              }}
                            />
                            {dupItems.has(i.id) ? <ExclamatonIcon style={{position: 'absolute', right: 5, bottom: 10, width: 20, height: 20}} fill={'#B33951'} /> : null}
                            </div>
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
