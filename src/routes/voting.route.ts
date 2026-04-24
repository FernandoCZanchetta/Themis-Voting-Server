import express from 'express'
import { getVotingById, getVotings } from '@controllers'
import { auth } from '@middlewares'

const router = express.Router()

router.get('/', auth, getVotings)

router.get('/:id', auth, getVotingById)

export default router
