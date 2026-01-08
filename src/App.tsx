import { useState } from 'react'
import {
  useGetScreeningListQuery,
  useGetScreeningQuery,
  useUpdateScreeningMutation,
} from './screeningsApi'

function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: screenings, isLoading: isListLoading } = useGetScreeningListQuery()
  const { data: screening, isFetching: isScreeningFetching } = useGetScreeningQuery(
    selectedId!,
    { skip: !selectedId }
  )

  // Show loading when switching to a different screening (not on revalidation of the same one)
  const isLoadingNewScreening = isScreeningFetching && screening?.id !== selectedId
  const [updateScreening] = useUpdateScreeningMutation()

  const getRiskColor = (score: number) => {
    if (score >= 7) return '#ef4444'
    if (score >= 4) return '#f59e0b'
    return '#22c55e'
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isListLoading) return <div style={styles.loading}>Loading screenings...</div>

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Screening Manager</h1>
      <p style={styles.subtitle}>
        Demonstrating <code style={styles.code}>invalidatesTags</code> with per-item cache tags
      </p>

      <div style={styles.content}>
        <div style={styles.list}>
          <h2 style={styles.sectionTitle}>Screenings</h2>
          {screenings?.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              style={{
                ...styles.listButton,
                backgroundColor: selectedId === s.id ? '#3b82f6' : '#2a2a2a',
                borderColor: selectedId === s.id ? '#3b82f6' : '#3a3a3a',
              }}
            >
              <span style={styles.address}>{truncateAddress(s.title)}</span>
            </button>
          ))}
        </div>

        <div style={styles.details}>
          {isLoadingNewScreening && <div style={styles.loadingSmall}>Loading...</div>}
          
          {screening && !isLoadingNewScreening && (
            <div style={styles.card}>
              
              <h2 style={styles.screeningTitle}>
                <span style={styles.addressFull}>{screening.title}</span>
              </h2>

              <div style={styles.riskContainer}>
                <span style={styles.riskLabel}>Risk Score</span>
                <span style={{
                  ...styles.riskScore,
                  backgroundColor: getRiskColor(screening.riskScore),
                }}>
                  {screening.riskScore.toFixed(1)}
                </span>
              </div>
              
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Status</label>
                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => updateScreening({ id: screening.id, status: 'open' })}
                    style={{
                      ...styles.toggleButton,
                      backgroundColor: screening.status === 'open' ? '#22c55e' : '#2a2a2a',
                      borderColor: screening.status === 'open' ? '#22c55e' : '#3a3a3a',
                    }}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => updateScreening({ id: screening.id, status: 'closed' })}
                    style={{
                      ...styles.toggleButton,
                      backgroundColor: screening.status === 'closed' ? '#ef4444' : '#2a2a2a',
                      borderColor: screening.status === 'closed' ? '#ef4444' : '#3a3a3a',
                    }}
                  >
                    Closed
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel}>Assignee</label>
                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => updateScreening({ id: screening.id, assignee: 'adam' })}
                    style={{
                      ...styles.toggleButton,
                      backgroundColor: screening.assignee === 'adam' ? '#8b5cf6' : '#2a2a2a',
                      borderColor: screening.assignee === 'adam' ? '#8b5cf6' : '#3a3a3a',
                    }}
                  >
                    Adam
                  </button>
                  <button
                    onClick={() => updateScreening({ id: screening.id, assignee: 'joe' })}
                    style={{
                      ...styles.toggleButton,
                      backgroundColor: screening.assignee === 'joe' ? '#f59e0b' : '#2a2a2a',
                      borderColor: screening.assignee === 'joe' ? '#f59e0b' : '#3a3a3a',
                    }}
                  >
                    Joe
                  </button>
                </div>
              </div>
            </div>
          )}

          {!selectedId && (
            <div style={styles.placeholder}>
              <p>← Select a screening to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#121212',
    minHeight: '100vh',
    color: '#e5e5e5',
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    fontSize: '2rem',
    fontWeight: 600,
    color: '#fff',
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: '40px',
    fontSize: '0.95rem',
  },
  code: {
    backgroundColor: '#2a2a2a',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.875rem',
    color: '#a78bfa',
  },
  content: {
    display: 'flex',
    gap: '40px',
  },
  list: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#888',
    marginBottom: '16px',
  },
  listButton: {
    display: 'block',
    width: '100%',
    padding: '14px 18px',
    marginBottom: '8px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    textAlign: 'left',
    color: '#e5e5e5',
    transition: 'all 0.15s ease',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: '0.9rem',
  },
  addressFull: {
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    wordBreak: 'break-all' as const,
  },
  details: {
    flex: 1.2,
  },
  card: {
    position: 'relative',
    padding: '28px',
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    border: '1px solid #2a2a2a',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    fontSize: '1rem',
    color: '#3b82f6',
    fontWeight: 500,
  },
  screeningTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#fff',
  },
  riskContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#252525',
    borderRadius: '8px',
  },
  riskLabel: {
    fontSize: '0.875rem',
    color: '#888',
    fontWeight: 500,
  },
  riskScore: {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
  },
  field: {
    marginBottom: '20px',
  },
  fieldLabel: {
    display: 'block',
    fontWeight: 500,
    marginBottom: '10px',
    color: '#888',
    fontSize: '0.875rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  toggleButton: {
    padding: '10px 24px',
    border: '1px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#e5e5e5',
    transition: 'all 0.15s ease',
  },
  loading: {
    textAlign: 'center',
    padding: '80px 40px',
    fontSize: '1.1rem',
    color: '#888',
    backgroundColor: '#121212',
    minHeight: '100vh',
  },
  loadingSmall: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '1rem',
    color: '#888',
  },
  placeholder: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    border: '1px dashed #3a3a3a',
  },
}

export default App
