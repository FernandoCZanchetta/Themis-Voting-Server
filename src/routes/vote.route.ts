import express from 'express'
import { voteHandler } from '@controllers'
import { auth } from '@middlewares'

const router = express.Router()

router.post('/votings/:votingId/vote', auth, voteHandler)

export default router
