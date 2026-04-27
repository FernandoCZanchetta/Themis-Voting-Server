import express from 'express'
import { auditVote } from '@controllers'

const router = express.Router()

router.post('/', auditVote)

export default router
