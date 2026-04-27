import { Request, Response } from 'express'
import { prismaClient } from '@db'
import { auditSchema } from '@schemas'
import { generateReceiptSignature, generateVoteHash, safeCompare } from '@utils'

export async function auditVote(req: Request, res: Response) {
  try {
    console.info('[Audit Controller] Parsing request body...')
    const validatedBody = auditSchema.safeParse(req.body)

    if (!validatedBody.success) {
      console.error('[ERROR] [Audit Controller] Invalid receipt data format arrived!')
      return res.status(400).json({ error: 'Invalid receipt data format!' })
    }

    console.info('[Audit Controller] Extracting data from the validated request body...')
    const { hash: voteHash, nonce, signature: voteSignature } = validatedBody.data

    console.info('[Audit Controller] Retrieving user vote...')
    const vote = await prismaClient.vote.findUnique({ where: { voteHash } })

    console.info('[Audit Controller] Checking if vote existis...')
    if (!vote) {
      return res
        .status(404)
        .json({ error: 'Vote Not Found!', cause: 'Your Vote Was Not Found! Check Data and Retry!', valid: false })
    }

    console.info('[Audit Controller] Checking nonce validty...')
    if (!safeCompare(nonce, vote.nonce)) {
      return res.status(424).json({ error: 'Invalid!', cause: 'Nonce mismatch!', valid: false })
    }

    console.info('[Audit Controller] Regenerating vote signature...')
    const expectedVoteSignature = generateReceiptSignature(voteHash, nonce)

    console.info('[Audit Controller] Checkgin signature validity...')
    if (!safeCompare(expectedVoteSignature, voteSignature)) {
      return res
        .status(424)
        .json({ error: 'Invalid!', cause: 'The Signature Is Invalid, Your Vote Could Be Compromised!', valid: false })
    }

    console.info('[Audit Controller] Recomputing vote hash...')
    const recomputedVoteHash = generateVoteHash(vote.voterToken, vote.votingId, vote.optionId, nonce)

    console.info('[Audit Controller] Checking vote hash validity...')
    if (!safeCompare(recomputedVoteHash, voteHash)) {
      return res
        .status(424)
        .json({ error: 'Invalid!', cause: 'The Vote Hash Is Invalid, Your Vote Could Be Compromised!', valid: false })
    }

    console.info('[Audit Controller] Returning more vote information to user...')
    return res
      .status(200)
      .json({ valid: true, votingId: vote.votingId, createdAt: vote.createdAt, revoked: !!vote.revokedAt })
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[ERROR] [Audit Controller] Failed To Audit Vote!' + err.message)
      return res
        .status(500)
        .json({ error: 'Vote Auditing Failed', cause: 'Unexpected Error While Auditing Vote, Try Again Later!' })
    }

    console.error('[ERROR] [Audit Controller] Unknown error found when auditing vote!')
    return res
      .status(500)
      .json({
        error: 'Vote Auditing Failed',
        cause: 'Unknown error found while auditing vote! Try again later or contact us!',
      })
  }
}
