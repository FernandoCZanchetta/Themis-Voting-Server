import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@generated'

dotenv.config()

const { PRISMA_DATABASE_URL } = process.env

if (!process.env.PRISMA_DATABASE_URL) {
  console.error('[ERROR] [Prisma DB] PRISMA_DATABASE_URL not defined in .env!')
  throw new Error('[ERROR] [Prisma DB] PRISMA_DATABASE_URL not defined in .env!')
}

const prismaPgAdapter = new PrismaPg({ connectionString: PRISMA_DATABASE_URL })
const prismaClient = new PrismaClient({ adapter: prismaPgAdapter })

export default prismaClient
