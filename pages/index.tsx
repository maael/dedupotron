import Head from "next/head";
import ExclamatonIcon from "../components/icons/ExclamationIcon";
import ItemIcon, {styles} from '../components/ItemIcon';
import Checkbox from '../components/Checkbox';
import useDedupotron from '../components/hooks/useDedupotron';
import useFathom from '../components/hooks/useFathom';
import useSearch from '../components/hooks/useSearch';
import useSortInventories from '../components/hooks/useSortInventories';
import useLocalstorage, {LocalStorageKeys} from '../components/hooks/useLocalstorage';
import chunk from '../util/chunk';
import { useState } from "react";

const BANK_SIZE = 30;
const INVENTORY_WIDTH = 10;

/**
 * TODO: Track where the dups are for easier stacking
 */

export default function Index() {
  useFathom();
  const [highlightGear, setHighlightGear] = useLocalstorage(LocalStorageKeys.SETTING_HIGHLIGHT_GEAR, false);
  const [onlyDuplicates, setOnlyDuplicates] = useLocalstorage(LocalStorageKeys.SETTING_ONLY_DUPLICATES, false);
  const {loading, error, bank, expandedInventories, dupItems, selected, apiKey, setSelected, setApiKey} = useDedupotron(highlightGear);
  const [search, setSearch] = useState('');
  const sortedInventories = useSortInventories(selected, expandedInventories);
  const [filteredBank, filteredInventories] = useSearch(bank, sortedInventories, search);
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
        <li>Enter a name of your choice and check at least the "inventories" and "characters" permission checkboxes.</li>
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
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={{ maxWidth: 590, margin: "20px auto", display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <Checkbox value={onlyDuplicates} style={{marginBottom: 10}} setValue={setOnlyDuplicates} label={'Only show duplicates'} type='circular' />
        <Checkbox value={highlightGear} style={{marginBottom: 10}} setValue={setHighlightGear} label={'Highlight gear'} type='circular' />
      </div>
      <div style={{ maxWidth: 590, margin: "20px auto", textAlign: 'center', fontSize: '1.2em' }}>
        Click on any item below to highlight it and any duplicates.
      </div>
      <div style={{height: '1em'}}>
      {loading ? (
        <div style={{ color: "#FFFFFF", textAlign: "center" }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "#B33951", textAlign: "center" }}><ExclamatonIcon style={{height: '1em', width: '1em', display: 'inline-block', marginRight: 5, position: 'relative', top: 2}} fill={'#B33951'} />{error}</div>
      ) : null}
      </div>
      <div style={{ maxWidth: 590, margin: "0px auto", textIndent: 5, fontSize: "2em", position: 'sticky', top: 0, zIndex: 99, background: '#262523' }}>
        Bank
      </div>
      {chunk(filteredBank, BANK_SIZE).map((bankTab, i) => (
        <div
          key={`bank-tab-${i}`}
          style={{ maxWidth: 590, margin: "10px auto", textAlign: "center" }}
        >
          {bankTab.map((b, j) =>
            <ItemIcon item={b} selected={selected} setSelected={setSelected} dupItems={dupItems} key={`bank-item-${i}-${j}`} inventories={expandedInventories} onlyDuplicates={onlyDuplicates} />
          )}
        </div>
      ))}
      <div style={{ maxWidth: 590, margin: "0px auto", textIndent: 5, fontSize: "2.5em" }}>
        Inventories
      </div>
      <div>
        {filteredInventories.map(({ character, inventory }) => (
          <div
            key={character.name}
            style={{
              width:
                INVENTORY_WIDTH * styles.icon.width + INVENTORY_WIDTH * 2 * 4,
              maxWidth: '100%',
              margin: "0 auto",
            }}
          >
            <div style={{width: '100%', position: 'sticky', top: 0, zIndex: 99, background: '#262523', padding: 5}}>
              <div style={{fontSize: '2em', margin: '10px 0px 5px 0px'}}>{character.name}</div>
            </div>
            {inventory.map((bag, idx) =>
              bag ? (
                <div key={`${character.name}${bag.id}${idx}`}>
                  {bag
                    ? bag.inventory.map((i, idx2) => (
                      <ItemIcon item={i} selected={selected} setSelected={setSelected} dupItems={dupItems} key={`inv-item-${idx}-${idx2}`} inventories={expandedInventories} onlyDuplicates={onlyDuplicates} />
                    )) : null}
                </div>
              ) : null
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
