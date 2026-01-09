import { useState, useRef, useEffect } from 'react'
import { useGetItemQuery, testbedApi, Item, GetItemArgs } from './testbedApi'
import { useDispatch, useSelector } from 'react-redux'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { SerializedError } from '@reduxjs/toolkit'
import { RootState } from './store'

// Styles
const styles = {
  container: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    backgroundColor: '#0d1117',
    minHeight: '100vh',
    color: '#c9d1d9',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#f0f6fc',
    margin: 0,
  },
  subtitle: {
    color: '#8b949e',
    marginTop: '8px',
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  section: {
    backgroundColor: '#161b22',
    borderRadius: '8px',
    border: '1px solid #30363d',
    padding: '20px',
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#8b949e',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #30363d',
  },
  controls: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginBottom: '16px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #30363d',
    backgroundColor: '#21262d',
    color: '#c9d1d9',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  buttonActive: {
    backgroundColor: '#238636',
    borderColor: '#238636',
    color: '#fff',
  },
  buttonAction: {
    backgroundColor: '#1f6feb',
    borderColor: '#1f6feb',
    color: '#fff',
  },
  buttonDanger: {
    backgroundColor: '#da3633',
    borderColor: '#da3633',
    color: '#fff',
  },
  stateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  stateItem: {
    backgroundColor: '#0d1117',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #30363d',
  },
  stateLabel: {
    fontSize: '0.75rem',
    color: '#8b949e',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  stateValue: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  stateTrue: { color: '#3fb950' },
  stateFalse: { color: '#f85149' },
  stateNull: { color: '#8b949e' },
  stateError: { color: '#f85149', backgroundColor: '#f8514922' },
  errorToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8514911',
    borderRadius: '6px',
    border: '1px solid #f8514933',
    marginBottom: '16px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  dataPreview: {
    backgroundColor: '#0d1117',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #30363d',
    marginTop: '12px',
    fontSize: '0.8rem',
    overflow: 'auto',
    maxHeight: '200px',
  },
  dataLabel: {
    fontSize: '0.75rem',
    color: '#8b949e',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  timeline: {
    maxHeight: '400px',
    overflow: 'auto',
    fontSize: '0.75rem',
  },
  timelineEntry: {
    padding: '8px 12px',
    borderBottom: '1px solid #21262d',
    display: 'flex',
    gap: '12px',
  },
  timelineTime: {
    color: '#8b949e',
    minWidth: '80px',
    flexShrink: 0,
  },
  timelineEvent: {
    color: '#c9d1d9',
    flex: 1,
  },
  cacheSection: {
    gridColumn: '1 / -1',
  },
  cacheEntries: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  cacheEntry: {
    backgroundColor: '#0d1117',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #30363d',
    fontSize: '0.8rem',
  },
  cacheEntryLabel: {
    fontSize: '0.75rem',
    color: '#58a6ff',
    fontWeight: 600,
    marginBottom: '8px',
  },
  explanation: {
    gridColumn: '1 / -1',
    backgroundColor: '#161b22',
    borderRadius: '8px',
    border: '1px solid #30363d',
    padding: '24px',
    marginTop: '8px',
  },
  explanationTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#f0f6fc',
    marginBottom: '16px',
  },
  explanationItem: {
    marginBottom: '16px',
    paddingLeft: '16px',
    borderLeft: '3px solid #30363d',
  },
  explanationTerm: {
    color: '#58a6ff',
    fontWeight: 600,
    marginBottom: '4px',
  },
  explanationDesc: {
    color: '#8b949e',
    lineHeight: 1.6,
    fontSize: '0.9rem',
  },
  highlight: {
    backgroundColor: '#1f6feb33',
    padding: '2px 6px',
    borderRadius: '3px',
    color: '#58a6ff',
  },
} as const

interface LogEntry {
  time: string
  event: string
  values: {
    isLoading: boolean
    isFetching: boolean
    isError: boolean
    data: Item | undefined
    currentData: Item | undefined
    error: FetchBaseQueryError | SerializedError | undefined
  }
}

function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

function StateValue({ value, label }: { value: boolean | undefined | null; label: string }) {
  const isTrue = value === true
  const isFalse = value === false
  
  return (
    <div style={styles.stateItem}>
      <div style={styles.stateLabel}>{label}</div>
      <div
        style={{
          ...styles.stateValue,
          ...(isTrue ? styles.stateTrue : isFalse ? styles.stateFalse : styles.stateNull),
        }}
      >
        {String(value)}
      </div>
    </div>
  )
}

function DataPreview({ 
  data, 
  label, 
  staleWarning,
  isError,
}: { 
  data: unknown
  label: string
  staleWarning?: boolean
  isError?: boolean
}) {
  const borderColor = isError ? '#f85149' : staleWarning ? '#d29922' : '#30363d'
  const bgColor = isError ? '#f8514911' : staleWarning ? '#d299220d' : undefined
  const labelColor = isError ? '#f85149' : staleWarning ? '#d29922' : '#8b949e'
  
  return (
    <div style={{
      ...styles.dataPreview,
      borderColor,
      ...(bgColor ? { backgroundColor: bgColor } : {}),
    }}>
      <div style={{ ...styles.dataLabel, color: labelColor }}>
        {label} {staleWarning && <span style={{ fontSize: '0.7rem' }}>(⚠️ stale! from different arg)</span>}
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: data ? '#c9d1d9' : '#8b949e' }}>
        {formatValue(data)}
      </pre>
    </div>
  )
}

function App() {
  const dispatch = useDispatch()
  const [selectedId, setSelectedId] = useState<number>(1)
  const [forceError, setForceError] = useState<boolean>(false)
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(false)
  const [pollingInterval, setPollingInterval] = useState<number>(3000)
  const [log, setLog] = useState<LogEntry[]>([])
  const prevStateRef = useRef<string>('')
  const logContainerRef = useRef<HTMLDivElement>(null)
  
  // Force re-render every second to update cache expiry countdowns
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // This is THE hook we're testing
  const queryArgs: GetItemArgs = { id: selectedId, forceError }
  const queryResult = useGetItemQuery(queryArgs, {
    pollingInterval: pollingEnabled ? pollingInterval : 0,
  })
  
  const { isLoading, isFetching, isError, error, data, currentData, refetch } = queryResult

  // Get the raw cache state for inspection
  const cacheState = useSelector((state: RootState) => state.testbedApi.queries)
  const subscriptions = useSelector((state: RootState) => state.testbedApi.subscriptions)

  // Log state changes
  useEffect(() => {
    const currentState = JSON.stringify({ 
      isLoading, isFetching, isError, 
      hasData: !!data, hasCurrentData: !!currentData,
      dataId: data?.id, currentDataId: currentData?.id
    })
    
    if (currentState !== prevStateRef.current) {
      prevStateRef.current = currentState
      
      const now = new Date()
      const time = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3 
      } as Intl.DateTimeFormatOptions)
      
      let event = ''
      if (isError) {
        event = `❌ ERROR for id=${selectedId}${forceError ? ' (forced)' : ''}`
      } else if (isLoading && isFetching) {
        event = `🔄 INITIAL LOAD for id=${selectedId} (no cached data yet)`
      } else if (isFetching && !isLoading) {
        event = `⟳ REFETCHING id=${selectedId} (has cached data, updating in background)`
      } else if (!isFetching && data) {
        event = `✓ RECEIVED data for id=${selectedId} (fetchCount: ${data.fetchCount})`
      } else if (!isFetching && !data) {
        event = `○ IDLE for id=${selectedId}`
      }
      
      setLog(prev => [...prev, {
        time,
        event,
        values: { isLoading, isFetching, isError, error, data, currentData }
      }])
    }
  }, [isLoading, isFetching, isError, error, data, currentData, selectedId, forceError])

  // Auto-scroll log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [log])

  const handleSelectId = (id: number) => {
    if (id !== selectedId) {
      setLog(prev => [...prev, {
        time: new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          fractionalSecondDigits: 3 
        } as Intl.DateTimeFormatOptions),
        event: `📍 SWITCHING from id=${selectedId} to id=${id}`,
        values: { isLoading, isFetching, isError, error, data, currentData }
      }])
      setSelectedId(id)
    }
  }

  const handleToggleError = () => {
    const newValue = !forceError
    setLog(prev => [...prev, {
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3 
      } as Intl.DateTimeFormatOptions),
      event: `⚡ ERROR MODE ${newValue ? 'ENABLED' : 'DISABLED'}`,
      values: { isLoading, isFetching, isError, error, data, currentData }
    }])
    setForceError(newValue)
  }

  const handleRefetch = () => {
    setLog(prev => [...prev, {
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3 
      } as Intl.DateTimeFormatOptions),
      event: `🔃 MANUAL REFETCH triggered for id=${selectedId}${forceError ? ' (error mode ON)' : ''}`,
      values: { isLoading, isFetching, isError, error, data, currentData }
    }])
    refetch()
  }

  const handleInvalidate = () => {
    setLog(prev => [...prev, {
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3 
      } as Intl.DateTimeFormatOptions),
      event: `🗑️ INVALIDATING cache for id=${selectedId}`,
      values: { isLoading, isFetching, isError, error, data, currentData }
    }])
    dispatch(testbedApi.util.invalidateTags([{ type: 'Item', id: selectedId }]))
  }

  const handleInvalidateAll = () => {
    setLog(prev => [...prev, {
      time: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3 
      } as Intl.DateTimeFormatOptions),
      event: `💥 INVALIDATING ALL Item cache entries`,
      values: { isLoading, isFetching, isError, error, data, currentData }
    }])
    dispatch(testbedApi.util.invalidateTags(['Item']))
  }

  const handleClearLog = () => {
    setLog([])
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>RTK Query useQuery Testbed</h1>
        <p style={styles.subtitle}>
          Explore how <code style={styles.highlight}>isLoading</code>, <code style={styles.highlight}>isFetching</code>, 
          <code style={styles.highlight}>data</code>, and <code style={styles.highlight}>currentData</code> behave 
          when switching between cache entries, refetching, and invalidating.
        </p>
        <a 
          href="https://github.com/ensconced/rtkloading" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            color: '#58a6ff',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          View on GitHub
        </a>
      </header>

      <div style={styles.mainContent}>
        {/* Controls Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Controls</h2>
          
          <div style={styles.dataLabel}>Select Item ID (each creates a separate cache entry)</div>
          <div style={styles.controls}>
            {[1, 2, 3].map(id => (
              <button
                key={id}
                style={{
                  ...styles.button,
                  ...(selectedId === id ? styles.buttonActive : {}),
                }}
                onClick={() => handleSelectId(id)}
              >
                Item {id}
              </button>
            ))}
          </div>

          <div style={styles.errorToggle}>
            <input 
              type="checkbox" 
              id="forceError" 
              checked={forceError} 
              onChange={handleToggleError}
              style={styles.checkbox}
            />
            <label htmlFor="forceError" style={{ cursor: 'pointer', color: forceError ? '#f85149' : '#8b949e' }}>
              Force errors on next fetch
            </label>
          </div>

          <div style={{
            ...styles.errorToggle,
            borderColor: pollingEnabled ? '#238636' : '#30363d',
            backgroundColor: pollingEnabled ? '#23863611' : 'transparent',
          }}>
            <input 
              type="checkbox" 
              id="polling" 
              checked={pollingEnabled} 
              onChange={() => {
                const newValue = !pollingEnabled
                setLog(prev => [...prev, {
                  time: new Date().toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    fractionalSecondDigits: 3 
                  } as Intl.DateTimeFormatOptions),
                  event: `🔄 POLLING ${newValue ? `ENABLED (${pollingInterval}ms)` : 'DISABLED'}`,
                  values: { isLoading, isFetching, isError, error, data, currentData }
                }])
                setPollingEnabled(newValue)
              }}
              style={styles.checkbox}
            />
            <label htmlFor="polling" style={{ cursor: 'pointer', color: pollingEnabled ? '#3fb950' : '#8b949e' }}>
              Enable polling
            </label>
            {pollingEnabled && (
              <select 
                value={pollingInterval} 
                onChange={(e) => setPollingInterval(Number(e.target.value))}
                style={{
                  marginLeft: 'auto',
                  padding: '4px 8px',
                  backgroundColor: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  color: '#c9d1d9',
                  fontSize: '0.8rem',
                }}
              >
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={3000}>3s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
              </select>
            )}
          </div>


          <div style={styles.dataLabel}>Actions for current selection (id={selectedId})</div>
          <div style={styles.controls}>
            <button 
              style={{ ...styles.button, ...styles.buttonAction }} 
              onClick={handleRefetch}
              disabled={isFetching}
            >
              Refetch
            </button>
            <button 
              style={{ ...styles.button, ...styles.buttonDanger }} 
              onClick={handleInvalidate}
            >
              Invalidate This
            </button>
            <button 
              style={{ ...styles.button, ...styles.buttonDanger }} 
              onClick={handleInvalidateAll}
            >
              Invalidate All
            </button>
          </div>
        </div>

        {/* Current State Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Current Hook Return Values (id={selectedId})</h2>
          
          <div style={styles.stateGrid}>
            <StateValue label="isLoading" value={isLoading} />
            <StateValue label="isFetching" value={isFetching} />
            <StateValue label="isError" value={isError} />
            <div style={styles.stateItem}>
              <div style={styles.stateLabel}>isSuccess</div>
              <div style={{
                ...styles.stateValue,
                ...(!isLoading && !isFetching && !isError && data ? styles.stateTrue : styles.stateFalse),
              }}>
                {String(!isLoading && !isFetching && !isError && !!data)}
              </div>
            </div>
          </div>

          <DataPreview 
            data={data} 
            label={`data ${data && data.id !== selectedId ? `(id=${data.id}, but selected=${selectedId})` : ''}`}
            staleWarning={data !== undefined && data.id !== selectedId}
          />
          <DataPreview 
            data={currentData} 
            label="currentData"
          />
          {isError && (
            <DataPreview 
              data={error} 
              label="error"
              isError={true}
            />
          )}
        </div>

        {/* Cache Inspection Section */}
        <div style={{ ...styles.section, ...styles.cacheSection }}>
          <h2 style={styles.sectionTitle}>Cache State (all entries for getItem)</h2>
          <div style={{ fontSize: '0.75rem', color: '#8b949e', marginBottom: '12px' }}>
            Each unique id creates a separate cache entry. Unused entries expire after 10s.
          </div>
          
          <div style={styles.cacheEntries}>
            {[1, 2, 3].map(id => {
              const cacheKey = `getItem(${id})`
              const entry = cacheState[cacheKey]
              const entrySubs = subscriptions[cacheKey] || {}
              const subCount = Object.keys(entrySubs).length
              const isCurrentlySelected = id === selectedId
              
              // Skip entries that don't exist and aren't currently selected
              if (!entry && !isCurrentlySelected) return null
              
              return (
                <div 
                  key={id} 
                  style={{
                    ...styles.cacheEntry,
                    borderColor: isCurrentlySelected ? '#58a6ff' : entry?.status === 'rejected' ? '#f85149' : '#30363d',
                    borderWidth: isCurrentlySelected ? 2 : 1,
                    opacity: entry ? 1 : 0.5,
                  }}
                >
                  <div style={styles.cacheEntryLabel}>
                    getItem({id}){isCurrentlySelected && ' ← current'}
                  </div>
                  {entry ? (
                    <>
                      <div style={{ color: '#8b949e', marginBottom: '4px' }}>
                        status: <span style={{ 
                          color: entry.status === 'fulfilled' ? '#3fb950' : 
                                 entry.status === 'pending' ? '#d29922' : 
                                 entry.status === 'rejected' ? '#f85149' : '#c9d1d9' 
                        }}>
                          {entry.status}
                        </span>
                      </div>
                      <div style={{ color: '#8b949e', marginBottom: '4px' }}>
                        subscribers: <span style={{ 
                          color: subCount > 0 ? '#3fb950' : '#d29922',
                          fontWeight: subCount > 0 ? 600 : 400,
                        }}>
                          {subCount}
                        </span>
                        {subCount === 0 && (
                          <span style={{ color: '#d29922', fontSize: '0.7rem', marginLeft: '4px' }}>
                            (will expire)
                          </span>
                        )}
                      </div>
                      {entry.data && (
                        <div style={{ color: '#8b949e' }}>
                          fetchCount: <span style={{ color: '#c9d1d9' }}>{(entry.data as Item).fetchCount}</span>
                        </div>
                      )}
                      {entry.error && (
                        <div style={{ color: '#f85149', fontSize: '0.75rem' }}>
                          has error
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: '#8b949e', fontStyle: 'italic' }}>
                      {isCurrentlySelected ? '(fetching...)' : '(no entry)'}
                    </div>
                  )}
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>

        {/* Timeline Section */}
        <div style={{ ...styles.section, ...styles.cacheSection }}>
          <h2 style={styles.sectionTitle}>
            State Change Timeline
            <button 
              style={{ ...styles.button, marginLeft: '12px', padding: '4px 8px', fontSize: '0.7rem' }}
              onClick={handleClearLog}
            >
              Clear
            </button>
          </h2>
          
          <div style={styles.timeline} ref={logContainerRef}>
            {log.length === 0 ? (
              <div style={{ color: '#8b949e', padding: '12px', fontStyle: 'italic' }}>
                Interact with the controls above to see state changes...
              </div>
            ) : (
              log.map((entry, i) => (
                <div key={i} style={styles.timelineEntry}>
                  <span style={styles.timelineTime}>{entry.time}</span>
                  <span style={styles.timelineEvent}>{entry.event}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Explanation Section */}
        <div style={styles.explanation}>
          <h2 style={styles.explanationTitle}>How It All Works</h2>
          
          <div style={{...styles.explanationItem, borderLeftColor: '#58a6ff', backgroundColor: '#58a6ff11', padding: '16px', borderRadius: '0 8px 8px 0'}}>
            <div style={styles.explanationTerm}>The "Current" Cache Entry</div>
            <div style={styles.explanationDesc}>
              When you call <code style={styles.highlight}>useGetItemQuery({"{"}id: 2{"}"})</code>, 
              RTK Query looks up (or creates) a <strong>cache entry</strong> for that argument. This is the 
              <strong> "current" cache entry</strong> for this hook instance.
              <br/><br/>
              <strong>Almost all values returned by the hook refer to this current cache entry:</strong>
              <br/>• <code style={styles.highlight}>isFetching</code> — is the <em>current</em> cache entry fetching?
              <br/>• <code style={styles.highlight}>isError</code> — did the <em>current</em> cache entry error?
              <br/>• <code style={styles.highlight}>currentData</code> — data from the <em>current</em> cache entry
              <br/>• <code style={styles.highlight}>error</code> — error from the <em>current</em> cache entry
              <br/><br/>
              When you change the argument (e.g. switch from id=1 to id=2), you're <strong>switching which cache entry 
              is "current"</strong>. The hook immediately starts reporting on the new cache entry.
              <br/><br/>
              <strong>The exceptions</strong> are <code style={styles.highlight}>data</code> and 
              <code style={styles.highlight}>isLoading</code>, which behave differently (see below).
            </div>
          </div>

          <div style={styles.explanationItem}>
            <div style={styles.explanationTerm}>data — the exception to "current"</div>
            <div style={styles.explanationDesc}>
              <code style={styles.highlight}>data</code> is <strong>"sticky"</strong> — it holds the last successful result 
              <strong> regardless of which cache entry it came from</strong>. When you switch from Item 1 to Item 2, 
              <code style={styles.highlight}>data</code> keeps showing Item 1's data until Item 2's request completes.
              <br/><br/>
              This is deliberate: it lets you keep showing <em>something</em> while the new data loads, 
              rather than flashing to empty/loading state.
              <br/><br/>
              <strong>Contrast with <code style={styles.highlight}>currentData</code>:</strong> which <em>is</em> tied 
              to the current cache entry. When you switch args, <code style={styles.highlight}>currentData</code> 
              immediately becomes <code style={styles.highlight}>undefined</code> until the new data arrives.
            </div>
          </div>

          <div style={styles.explanationItem}>
            <div style={styles.explanationTerm}>isLoading — also not purely "current"</div>
            <div style={styles.explanationDesc}>
              <code style={styles.highlight}>isLoading</code> is defined as: <strong>fetching the current cache entry 
              AND <code style={styles.highlight}>data</code> is undefined</strong>.
              <br/><br/>
              Since <code style={styles.highlight}>data</code> is sticky (not tied to current), 
              <code style={styles.highlight}>isLoading</code> is only <code style={styles.highlight}>true</code> on 
              the <strong>very first fetch ever</strong>, before any data from any arg has loaded.
              <br/><br/>
              Once you've loaded <em>any</em> item, <code style={styles.highlight}>isLoading</code> stays 
              <code style={styles.highlight}>false</code> — even when fetching a brand new uncached item.
              <br/><br/>
              <strong>Use case:</strong> Show an initial loading skeleton on first page load. Don't use it for 
              "loading state when switching items" — use <code style={styles.highlight}>isFetching</code> or 
              check <code style={styles.highlight}>currentData === undefined</code> for that.
            </div>
          </div>

          <div style={styles.explanationItem}>
            <div style={styles.explanationTerm}>isFetching — purely about the current cache entry</div>
            <div style={styles.explanationDesc}>
              <code style={styles.highlight}>isFetching</code> is <strong>true whenever the current cache entry 
              has a request in flight</strong> — initial load, refetch, or revalidation.
              <br/><br/>
              It doesn't care whether <code style={styles.highlight}>data</code> exists. It purely tracks: 
              "is there an active network request for the cache entry I'm subscribed to?"
              <br/><br/>
              <strong>Important:</strong> If <em>another</em> component is fetching a different cache entry 
              (e.g. id=3 while you're viewing id=1), your hook's <code style={styles.highlight}>isFetching</code> 
              is still <code style={styles.highlight}>false</code>. Each hook only reports on its own subscription.
            </div>
          </div>

          <div style={styles.explanationItem}>
            <div style={styles.explanationTerm}>Errors</div>
            <div style={styles.explanationDesc}>
              <code style={styles.highlight}>isError</code> and <code style={styles.highlight}>error</code> are 
              about the <strong>current cache entry</strong>.
              <br/><br/>
              When an error occurs, <code style={styles.highlight}>data</code> is <strong>preserved</strong> — it still 
              holds the last successful result (possibly from a different arg). This lets you show stale data 
              alongside an error message.
              <br/><br/>
              <code style={styles.highlight}>currentData</code> also preserves the last successful data for the 
              current arg specifically, even after an error on that same arg.
              <br/><br/>
              <code style={styles.highlight}>isFetching</code> is <code style={styles.highlight}>false</code> in 
              error state — the request completed (just unsuccessfully).
            </div>
          </div>

          <div style={styles.explanationItem}>
            <div style={styles.explanationTerm}>Cache keys & serializeQueryArgs</div>
            <div style={styles.explanationDesc}>
              By default, RTK Query uses the <strong>entire argument object</strong> as the cache key. 
              But you can customize this with <code style={styles.highlight}>serializeQueryArgs</code>.
              <br/><br/>
              In this testbed, the hook arg is <code style={styles.highlight}>{"{"}id, forceError{"}"}</code>, 
              but we use <code style={styles.highlight}>serializeQueryArgs</code> to only use 
              <code style={styles.highlight}>id</code> for the cache key. This means:
              <br/>• <code style={styles.highlight}>forceError</code> affects the request but not which cache entry is used
              <br/>• Toggling "Force errors" doesn't switch cache entries — it just changes what the next fetch does
              <br/>• Items 1, 2, 3 each have one cache entry, regardless of forceError state
            </div>
          </div>

          <div style={styles.explanationItem}>
            <div style={styles.explanationTerm}>Polling</div>
            <div style={styles.explanationDesc}>
              When <code style={styles.highlight}>pollingInterval</code> is set, RTK Query automatically 
              refetches the current cache entry at that interval.
              <br/><br/>
              <strong>Observe:</strong> Enable polling and watch the timeline. You'll see periodic 
              <code style={styles.highlight}>isFetching: true</code> → <code style={styles.highlight}>false</code> 
              cycles, and <code style={styles.highlight}>data.fetchCount</code> incrementing.
              <br/><br/>
              <strong>Key behaviors:</strong>
              <br/>• <code style={styles.highlight}>isLoading</code> stays <code style={styles.highlight}>false</code> 
              during polls (data already exists)
              <br/>• <code style={styles.highlight}>isFetching</code> becomes <code style={styles.highlight}>true</code> 
              during each poll
              <br/>• Polling continues even if a poll errors — try enabling both polling and "Force errors"
              <br/>• Polling stops when you switch to a different cache entry (different args)
              <br/>• Polling only happens while the component is mounted and the hook is subscribed
            </div>
          </div>

          <div style={styles.explanationItem}>
            <div style={styles.explanationTerm}>Cache Lifetime & Subscriptions</div>
            <div style={styles.explanationDesc}>
              Each <code style={styles.highlight}>useQuery</code> hook creates a <strong>subscription</strong> to 
              its cache entry. Cache entries stay alive as long as they have at least one subscriber.
              <br/><br/>
              When all subscribers unmount (or switch to different args), the entry becomes <strong>unused</strong>. 
              After <code style={styles.highlight}>keepUnusedDataFor</code> seconds (10s in this demo), 
              the entry is garbage collected and removed from the cache.
              <br/><br/>
              <strong>Try this:</strong>
              <br/>1. Load Item 1, then switch to Item 2
              <br/>2. Watch the Cache State — Item 1 now has 0 subscribers
              <br/>3. Wait 10 seconds — Item 1's cache entry disappears!
              <br/>4. Switch back to Item 1 — it has to fetch again (cache miss)
              <br/><br/>
              <strong>Note:</strong> The sticky <code style={styles.highlight}>data</code> may still show 
              data from a now-deleted cache entry — until a new fetch completes for the current arg.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
