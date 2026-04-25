import { Response } from 'express'
import { voteSchema } from '@schemas'
import { castVote } from '@services'
import { AuthRequest } from '@types'

export async function voteHandler(req: AuthRequest, res: Response) {
  try {
    console.info('[Vote Controller] Checking user...')
    const { user } = req

    if (!user) {
      console.error('[ERROR] [Vote Controller] Unauthorized user tried to vote!')
      return res.status(401).json({ error: 'Unauthorized', cause: 'Missing user, are you logged?! =O' })
    }

    console.info('[Vote Controller] Parsing request body...')
    const parsedBody = voteSchema.safeParse(req.body)

    if (!parsedBody.success) {
      console.error('[ERROR] [Vote Controller] Invalid body parameters in the request!')
      return res.status(400).json({ error: 'Invalid Body', cause: 'Check the body of your request!' })
    }

    const { votingId, optionId } = parsedBody.data

    console.info('[Vote Controller] Casting vote and waiting for receipt...')
    const result = await castVote({ user, votingId, optionId })

    console.info('[Vote Controller] Sending vote receipt to the user...')
    return res.status(201).json(result)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[ERROR] [Vote Controller] Failed To Handle Vote!' + err.message)
      return res
        .status(500)
        .json({ error: 'Vote Failed', cause: 'Unexpected error occoured during vote! Try again later!' })
    }

    console.error('[ERROR] [Vote Controller] Unknown error found when handling vote!')
    return res
      .status(500)
      .json({ error: 'Vote Failed', cause: 'Unknown error occoured during vote! Try again later or contact us!' })
  }
}
