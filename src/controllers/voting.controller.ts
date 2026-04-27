import { Response } from 'express'
import { prismaClient } from '@db'
import { VotingWhereInput } from '@generated'
import { votingsParamsSchema, votingsQuerySchema } from '@schemas'
import { AuthRequest } from '@types'
import { buildVotingEligibilityWhereFilter, isUserEligible } from '@utils'

export async function getVotings(req: AuthRequest, res: Response) {
  try {
    console.info('[Voting Controller] Checking user...')
    const { user } = req
    if (!user) {
      console.error('[ERROR] [Voting Controller] Unauthorized user reached votings!')
      return res.status(401).json({ error: 'Unauthorized', cause: 'It seems that you are not logged in... =O' })
    }

    console.info('[Voting Controller] Parsing request query...')
    const parsedQuery = votingsQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      console.error('[ERROR] [Voting Controller] Invalid query parameters inserted!')
      return res.status(400).json({ error: 'Invalid Query', cause: 'Check your query parameters!' })
    }

    const { status = 'active' } = parsedQuery.data

    console.info('[Voting Controller] Getting current date...')
    const now = new Date()

    console.info('[Voting Controller] Preparing votings eligibility filter...')
    const votingsEligibilityWhereFilter = buildVotingEligibilityWhereFilter(user)

    console.info('[Voting Controller] Preparing votings status filter...')
    const votingsStatusWhereFilter: VotingWhereInput[] = []
    switch (status) {
      case 'active': {
        votingsStatusWhereFilter.push({
          startAt: { lte: now },
          endAt: { gte: now },
        })
        break
      }
      case 'upcoming': {
        votingsStatusWhereFilter.push({
          startAt: { gt: now },
        })
        break
      }
      case 'finished': {
        votingsStatusWhereFilter.push({
          endAt: { lt: now },
        })
        break
      }
      default: {
        console.error('[ERROR] [Voting Controller] How did you even fell here???')
      }
    }

    console.info('[Voting Controller] Preparing final where filter...')
    const votingsWhereFilter: VotingWhereInput = {
      AND: [...votingsEligibilityWhereFilter, ...votingsStatusWhereFilter],
    }

    console.info('[Voting Controller] Getting votings...')
    const availableVotings = await prismaClient.voting.findMany({ where: votingsWhereFilter })

    console.info('[Voting Controller] Sending votings to user...')
    return res.status(200).json(availableVotings)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[ERROR] [Voting Controller] Failed to parse votings! Error:' + err.message)
      return res
        .status(500)
        .json({ error: 'Get Votings Failed', cause: 'Unexpected error during votings retrieval! Try again later!' })
    }

    console.error('[ERROR] [Voting Controller] Unknown error encountered when parsing votings!')
    return res.status(500).json({
      error: 'Get Votings Failed',
      cause: 'Unknown error during votings retrieval! Try again later or contact us!',
    })
  }
}

export async function getVotingById(req: AuthRequest<{ votingId: string }>, res: Response) {
  try {
    console.info('[Voting Controller] Checking user...')
    const { user } = req
    if (!user) {
      console.error('[ERROR] [Voting Controller] Unauthorized user reached votings!')
      return res.status(401).json({ error: 'Unauthorized', cause: 'It seems that you are not logged in... =O' })
    }

    console.info('[Voting Controller] Parsing voting ID in request params...')
    const parsedParams = votingsParamsSchema.safeParse(req.params)

    if (!parsedParams.success) {
      console.error('[ERROR] [Voting Controller] Invalid params parameters in the request!')
      return res.status(400).json({ error: 'Invalid Params', cause: 'Check the params of your request!' })
    }

    const { id } = parsedParams.data

    console.info('[Voting Controller] Getting voting from DB...')
    const voting = await prismaClient.voting.findUnique({ where: { id }, include: { votingOptions: true } })

    console.info('[Voting Controller] Checking if voting exists...')
    if (!voting) {
      return res.status(404).json({ error: 'Voting Not Found', cause: 'It seems like it does not exist...' })
    }

    console.info('[Voting Controller] Checking if user is eligible to the voting...')
    if (!isUserEligible(user, voting)) {
      return res
        .status(403)
        .json({ error: 'Forbidden', cause: 'The voting you tried to access is not available for you... =(' })
    }

    return res.status(200).json(voting)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[ERROR] [Voting Controller] Failed to parse voting by ID! Error: ' + err.message)
      return res.status(500).json({
        error: 'Get Voting By ID Failed',
        cause: 'Unexpected error while retrieving voting by ID! Try again later!',
      })
    }

    console.error('[ERROR] [Voting Controller] Unknown error encountered when parsing voting by ID!')
    return res.status(500).json({
      error: 'Get Voting By ID Failed',
      cause: 'Unknown error while retrieving voting by ID! Try again later or contact us!',
    })
  }
}
