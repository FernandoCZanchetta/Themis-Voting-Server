import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { prismaClient } from '@db'
import { auditRoutes, authRoutes, voteRoutes, votingRoutes } from '@routes'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

app.use('/audit', auditRoutes)
app.use('/auth', authRoutes)
app.use('/vote', voteRoutes)
app.use('/voting', votingRoutes)

async function startServer() {
  if (!process.env.PRISMA_DATABASE_URL) {
    console.error('[ERROR] [Server] PRISMA_DATABASE_URL not defined in .env!')
    throw new Error('[ERROR] [Server] PRISMA_DATABASE_URL not defined in .env!')
  }
  if (!process.env.JWT_SIGNING_SECRET) {
    console.error('[ERROR] [Server] JWT_SIGNING_SECRET not defined in .env!')
    throw new Error('[ERROR] [Server] JWT_SIGNING_SECRET not defined in .env!')
  }
  if (!process.env.VOTER_TOKEN_SECRET) {
    console.error('[ERROR] [Server] VOTER_TOKEN_SECRET not defined in .env!')
    throw new Error('[ERROR] [Server] VOTER_TOKEN_SECRET not defined in .env!')
  }
  if (!process.env.SERVER_SECRET) {
    console.error('[ERROR] [Server] SERVER_SECRET not defined in .env!')
    throw new Error('[ERROR] [Server] SERVER_SECRET not defined in .env!')
  }
  if (!process.env.RECEIPT_SIGNATURE_SECRET) {
    console.error('[ERROR] [Server] RECEIPT_SIGNATURE_SECRET not defined in .env!')
    throw new Error('[ERROR] [Server] RECEIPT_SIGNATURE_SECRET not defined in .env!')
  }

  try {
    await prismaClient.$connect()
    console.log('Successfully connected to DB!')

    app.listen(process.env.SERVER_PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${process.env.SERVER_PORT}`)
    })
  } catch (err) {
    console.error('[ERROR] [Server] Fail to launch server =(   Error: ', err)
    process.exit(1)
  }
}

try {
  ;(async () => {
    await startServer()
  })()
    .then(() => console.log('[SUCCESS] Server started!'))
    .catch(err => console.log(err))
} catch (error) {
  console.error('[ERROR] [Server] Fail to launch server =(   Error: ', error)
}
