import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import receiptsRouter from './routes/receipts'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-user-id']
}))

app.use(express.json())

// Routes
app.use('/api/receipts', receiptsRouter)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Backend beží na http://localhost:${PORT}`)
})