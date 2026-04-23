import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@generated'

dotenv.config()

const prismaPgAdapter = new PrismaPg({ connectionString: `${process.env.PRISMA_DATABASE_URL}` })
const prismaClient = new PrismaClient({ adapter: prismaPgAdapter })

export default prismaClient
