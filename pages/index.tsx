import Head from 'next/head'
import { PropsWithChildren, useState } from 'react'
import { FiGithub, FiHeart, FiCoffee, FiPlus, FiMinus } from 'react-icons/fi'
import ExclamatonIcon from '../components/icons/ExclamationIcon'
import ItemIcon, { styles } from '../components/ItemIcon'
import Checkbox from '../components/Checkbox'
import useDedupotron from '../components/hooks/useDedupotron'
import useFathom from '../components/hooks/useFathom'
import useSearch from '../components/hooks/useSearch'
import useSortInventories from '../components/hooks/useSortInventories'
import useLocalstorage, { LocalStorageKeys } from '../components/hooks/useLocalstorage'
import chunk from '../util/chunk'
import useGuilds from '../components/hooks/useGuilds'
import EmojiFavicon from '../components/EmojiFavicon'

const BANK_SIZE = 30
const INVENTORY_WIDTH = 10

/**
 * TODO: Track where the dups are for easier stacking
 */

function ToggleCollapsedSection({
  collapsed,
  setCollapsed,
  section,
}: {
  collapsed: string[]
  setCollapsed: any
  section: string
}) {
  const isCollapsed = collapsed.includes(section)
  const Icon = isCollapsed ? FiPlus : FiMinus
  return (
    <>
      <div style={{ flex: 1 }} />
      <Icon
        style={{ justifySelf: 'flex-end', cursor: 'pointer' }}
        size={30}
        onClick={() => setCollapsed(isCollapsed ? collapsed.filter((c) => c !== section) : collapsed.concat(section))}
      />
    </>
  )
}

function CollapseableSection({
  collapsed,
  section,
  children,
}: PropsWithChildren<{ section: string; collapsed: string[] }>) {
  return collapsed.includes(section) ? null : <>{children}</>
}

export default function Index() {
  useFathom()
  const [apiKey, setApiKey] = useLocalstorage(LocalStorageKeys.API_KEY, '')
  const [collapsedSections, setCollapsedSections] = useLocalstorage<string[]>(
    LocalStorageKeys.SETTING_COLLAPSED_SECTIONS,
    []
  )
  const [showGuilds, setShowGuilds] = useLocalstorage(LocalStorageKeys.SETTING_SHOW_GUILDS, false)
  const [highlightGear, setHighlightGear] = useLocalstorage(LocalStorageKeys.SETTING_HIGHLIGHT_GEAR, false)
  const [onlyDuplicates, setOnlyDuplicates] = useLocalstorage(LocalStorageKeys.SETTING_ONLY_DUPLICATES, false)
  const [compact, setCompact] = useLocalstorage(LocalStorageKeys.SETTING_COMPACT, false)
  const { loading: loadingGuilds, error: errorGuilds, result: guildStashes } = useGuilds(apiKey, showGuilds)
  const { loading, error, bank, expandedInventories, dupItems, selected, setSelected } = useDedupotron(
    apiKey,
    highlightGear,
    guildStashes
  )
  const [search, setSearch] = useState('')
  const sortedInventories = useSortInventories(selected, expandedInventories)
  const [filteredBank, filteredInventories, filteredGuildStashes] = useSearch(
    bank,
    sortedInventories,
    guildStashes,
    search
  )
  return (
    <div>
      <style jsx global>{`
        body {
          background-color: #262523;
          color: #f1f7ed;
          font-family: Arial, sans-serif;
          padding-bottom: 50px;
        }

        input::placeholder {
          color: #f1f7ed;
        }

        a {
          color: #b33951;
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
        <title>Dedupe-o-tron | Find duplicates across your inventories and bank tabs that you could stack.</title>
      </Head>
      <EmojiFavicon emoji="🤖" />
      <div
        style={{
          maxWidth: 590,
          margin: '20px auto 10px auto',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ margin: '20px 20px 0px 20px' }}>
          <div style={{ fontSize: '2.5em', marginBottom: 10 }}>🤖 Dedupe-o-tron</div>
          <div>
            Find duplicates across your Guild Wars 2 characters inventories and bank tabs that you can stack to save
            space.
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.5em' }}>
            Made by <a href="http://reddit.com/u/maael">u/maael</a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.6em', fontSize: '0.9em' }}>
            Code here:{' '}
            <a href="https://github.com/maael/dedupotron">
              <FiGithub style={{ position: 'relative', top: 2 }} />
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.5em', fontSize: '0.8em', opacity: 0.7 }}>
            Like the site? Sponsor me on GitHub{' '}
            <a href="https://github.com/sponsors/maael">
              <FiHeart style={{ position: 'relative', top: 2 }} />
            </a>{' '}
            or buy me a{' '}
            <a href="https://www.buymeacoffee.com/matte">
              <FiCoffee style={{ position: 'relative', top: 2 }} />
            </a>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 590, margin: '10px auto 20px auto' }}>
        <ol>
          <li>
            Open the <a href="https://account.arena.net/applications">official Guild Wars 2 API Key Management</a>.
          </li>
          <li>Click on the "New Key" button.</li>
          <li>
            Enter a name of your choice and check at least the "inventories" and "characters" permission checkboxes.
          </li>
          <li>Copy your new API key. CTRL + C</li>
          <li>Paste it in the form above. CTRL + V</li>
        </ol>
      </div>
      <div style={{ maxWidth: 590, margin: '20px auto' }}>
        <input
          type="text"
          style={{
            backgroundColor: '#71675A',
            width: '100%',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            padding: 10,
            boxSizing: 'border-box',
            fontSize: '1.5em',
            textOverflow: 'ellipsis',
          }}
          placeholder="API Key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div style={{ maxWidth: 590, margin: '20px auto' }}>
        <input
          type="text"
          style={{
            backgroundColor: '#71675A',
            width: '100%',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            padding: 10,
            boxSizing: 'border-box',
            fontSize: '1.5em',
            textOverflow: 'ellipsis',
          }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div
        style={{
          maxWidth: 590,
          margin: '20px auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Checkbox
          value={onlyDuplicates}
          style={{ marginBottom: 10 }}
          setValue={setOnlyDuplicates}
          label={'Only show duplicates'}
          type="circular"
        />
        <Checkbox
          value={compact}
          style={{ marginBottom: 10 }}
          setValue={setCompact}
          label={'Compact'}
          type="circular"
        />
        <Checkbox
          value={highlightGear}
          style={{ marginBottom: 10 }}
          setValue={setHighlightGear}
          label={'Highlight gear'}
          type="circular"
        />
        <Checkbox
          value={showGuilds}
          style={{ marginBottom: 10 }}
          setValue={setShowGuilds}
          label={'Show guilds'}
          type="circular"
        />
      </div>
      <div style={{ maxWidth: 590, margin: '20px auto', textAlign: 'center', fontSize: '1.2em' }}>
        Click on any item below to highlight it and any duplicates.
      </div>
      <div style={{ height: '1.5em' }}>
        {loading ? (
          <div style={{ color: '#FFFFFF', textAlign: 'center' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: '#B33951', textAlign: 'center' }}>
            <ExclamatonIcon
              style={{
                height: '1em',
                width: '1em',
                display: 'inline-block',
                marginRight: 5,
                position: 'relative',
                top: 2,
              }}
              fill={'#B33951'}
            />
            {error}
          </div>
        ) : null}
      </div>
      {(guildStashes.length !== 0 || loadingGuilds) && showGuilds ? (
        <>
          <div
            style={{
              maxWidth: 590,
              margin: '0px auto',
              textIndent: 5,
              fontSize: '2em',
              position: 'sticky',
              top: 0,
              zIndex: 99,
              background: '#262523',
              display: 'flex',
            }}
          >
            Guild Banks{' '}
            <ToggleCollapsedSection
              collapsed={collapsedSections}
              setCollapsed={setCollapsedSections}
              section="Guild Banks"
            />
          </div>
          <CollapseableSection collapsed={collapsedSections} section="Guild Banks">
            <div style={{ height: '1.5em' }}>
              {loadingGuilds ? (
                <div style={{ color: '#FFFFFF', textAlign: 'center' }}>Loading guild info...</div>
              ) : errorGuilds ? (
                <div style={{ color: '#B33951', textAlign: 'center', textTransform: 'capitalize' }}>
                  <ExclamatonIcon
                    style={{
                      height: '1em',
                      width: '1em',
                      display: 'inline-block',
                      marginRight: 5,
                      position: 'relative',
                      top: 2,
                    }}
                    fill={'#B33951'}
                  />
                  {errorGuilds}
                </div>
              ) : null}
            </div>
            {filteredGuildStashes.map(({ id, name, stash }) => (
              <div key={id}>
                <div
                  style={{
                    maxWidth: 590,
                    margin: '0px auto',
                    textIndent: 5,
                    fontSize: '2em',
                    position: 'sticky',
                    top: 0,
                    zIndex: 99,
                    background: '#262523',
                    display: 'flex',
                  }}
                >
                  {name}{' '}
                  <ToggleCollapsedSection
                    collapsed={collapsedSections}
                    setCollapsed={setCollapsedSections}
                    section={`GB-${name}`}
                  />
                </div>
                <CollapseableSection collapsed={collapsedSections} section={`GB-${name}`}>
                  {stash.map((container, i) => (
                    <div
                      key={`guild-bank-tab-${id}-${i}`}
                      style={{ maxWidth: 590, margin: '10px auto', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '1.2em', textAlign: 'left', textIndent: 15, marginBottom: '0.3em' }}>
                        {container.note}
                      </div>
                      {container.inventory.map((item, j) => (
                        <ItemIcon
                          item={item}
                          selected={selected}
                          setSelected={setSelected}
                          dupItems={dupItems}
                          key={`guild-bank-item-${id}-${i}-${j}`}
                          inventories={expandedInventories}
                          onlyDuplicates={onlyDuplicates}
                          compact={compact}
                        />
                      ))}
                    </div>
                  ))}
                </CollapseableSection>
              </div>
            ))}
          </CollapseableSection>
        </>
      ) : null}
      <div
        key="banktitle"
        style={{
          maxWidth: 590,
          margin: '0px auto',
          textIndent: 5,
          fontSize: '2em',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          background: '#262523',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        Bank <ToggleCollapsedSection collapsed={collapsedSections} setCollapsed={setCollapsedSections} section="Bank" />
      </div>
      <CollapseableSection collapsed={collapsedSections} section="Bank">
        {chunk(filteredBank, BANK_SIZE).map((bankTab, i) => (
          <div key={`bank-tab-${i}`} style={{ maxWidth: 590, margin: '10px auto', textAlign: 'center' }}>
            {bankTab.map((b, j) => (
              <ItemIcon
                item={b}
                selected={selected}
                setSelected={setSelected}
                dupItems={dupItems}
                key={`bank-item-${i}-${j}`}
                inventories={expandedInventories}
                onlyDuplicates={onlyDuplicates}
                compact={compact}
              />
            ))}
          </div>
        ))}
      </CollapseableSection>
      <div
        style={{
          maxWidth: 590,
          margin: '0px auto',
          textIndent: 5,
          fontSize: '2.5em',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        Inventories{' '}
        <ToggleCollapsedSection
          collapsed={collapsedSections}
          setCollapsed={setCollapsedSections}
          section="Inventories"
        />
      </div>
      <CollapseableSection collapsed={collapsedSections} section="Inventories">
        <div>
          {filteredInventories.map(({ character, inventory }) => (
            <div
              key={character.name}
              style={{
                width: INVENTORY_WIDTH * styles.icon.width + INVENTORY_WIDTH * 2 * 4,
                maxWidth: '100%',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  width: '100%',
                  position: 'sticky',
                  top: 0,
                  zIndex: 99,
                  background: '#262523',
                  padding: 5,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '2em', margin: '10px 0px 5px 0px' }}>{character.name}</div>{' '}
                <ToggleCollapsedSection
                  collapsed={collapsedSections}
                  setCollapsed={setCollapsedSections}
                  section={`CH-${character.name}`}
                />
              </div>
              <CollapseableSection collapsed={collapsedSections} section={`CH-${character.name}`}>
                {inventory.map((bag, idx) =>
                  bag ? (
                    <div key={`${character.name}${bag.id}${idx}`}>
                      {bag
                        ? bag.inventory.map((i, idx2) => (
                            <ItemIcon
                              item={i}
                              selected={selected}
                              setSelected={setSelected}
                              dupItems={dupItems}
                              key={`inv-item-${idx}-${idx2}`}
                              inventories={expandedInventories}
                              onlyDuplicates={onlyDuplicates}
                              compact={compact}
                            />
                          ))
                        : null}
                    </div>
                  ) : null
                )}
              </CollapseableSection>
            </div>
          ))}
        </div>
      </CollapseableSection>
    </div>
  )
}
