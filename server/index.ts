import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, 'db.json')

interface Screening {
  id: number
  title: string
  status: 'open' | 'closed'
  assignee: 'adam' | 'joe'
  riskScore: number
}

interface DB {
  screenings: Screening[]
}

function readDB(): DB {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
}

function writeDB(data: DB): void {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const DELAY_MS = 1000

// GET all screenings (just id and title for the list)
app.get('/api/screenings', async (_req, res) => {
  await delay(DELAY_MS)
  const db = readDB()
  const list = db.screenings.map(({ id, title }) => ({ id, title }))
  res.json(list)
})

// GET single screening by id
app.get('/api/screenings/:id', async (req, res) => {
  await delay(DELAY_MS)
  const db = readDB()
  const id = parseInt(req.params.id)
  const screening = db.screenings.find((s) => s.id === id)
  if (!screening) {
    return res.status(404).json({ error: 'Screening not found' })
  }
  res.json(screening)
})

// PATCH update screening (status or assignee)
app.patch('/api/screenings/:id', async (req, res) => {
  await delay(DELAY_MS)
  const db = readDB()
  const id = parseInt(req.params.id)
  const screening = db.screenings.find((s) => s.id === id)
  if (!screening) {
    return res.status(404).json({ error: 'Screening not found' })
  }
  if (req.body.status) screening.status = req.body.status
  if (req.body.assignee) screening.assignee = req.body.assignee
  writeDB(db)
  res.json(screening)
})

// POST rescreen - mutates the risk score
app.post('/api/screenings/:id/rescreen', async (req, res) => {
  await delay(DELAY_MS)
  const db = readDB()
  const id = parseInt(req.params.id)
  const screening = db.screenings.find((s) => s.id === id)
  if (!screening) {
    return res.status(404).json({ error: 'Screening not found' })
  }
  // Generate a new random risk score between 0 and 10
  screening.riskScore = Math.round(Math.random() * 100) / 10
  writeDB(db)
  res.json(screening)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
