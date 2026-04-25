import { prismaClient } from '@db'
import { AuthUser, voteReceipt } from '@types'
import { generateNonce, generateReceiptSignature, generateVoteHash, generateVoterToken, isUserEligible } from '@utils'

export async function castVote({
  user,
  votingId,
  optionId,
}: {
  user: AuthUser
  votingId: string
  optionId: string
}): Promise<voteReceipt> {
  console.info('[Vote Service] Searching for the voting...')
  const voting = await prismaClient.voting.findUnique({ where: { id: votingId } })

  console.info('[Vote Service] Checking if the voting exists...')
  if (!voting) {
    console.error('[ERROR] [Vote Service] Voting Not Found...')
    throw new Error('[ERROR] [Vote Service] 404 - Voting Not Found...')
  }

  console.info('[Vote Service] Getting current date...')
  const now = new Date()
  const isVotingActive = now >= voting.startAt && now <= voting.endAt

  console.info('[Vote Service] Checking if voting is active...')
  if (!isVotingActive) {
    console.error('[ERROR] [Vote Service] Voting Not Active...')
    throw new Error('[ERROR] [Vote Service] 403 - Voting Not Active...')
  }

  console.info('[Vote Service] Checking if user is eligible to vote...')
  if (!isUserEligible(user, voting)) {
    console.error('[ERROR] [Vote Service] User Not Eligible To Vote In ' + voting.name)
    throw new Error('[ERROR] [Vote Service] 403 - User Not Eligible To Vote In ' + voting.name + '...')
  }

  console.info('[Vote Service] Checking if selected voting option is valid...')
  const userSelectedVotingOption = await prismaClient.votingOption.findUnique({
    where: { id: optionId },
  })
  if (!userSelectedVotingOption) {
    console.error('[ERROR] [Vote Service] Invalid voting option!')
    throw new Error('[ERROR] [Vote Service] 400 - Invalid voting option!')
  }

  console.info('[Vote Service] Generating voter token...')
  const voterToken = generateVoterToken(user.nUSPHash, votingId)

  console.info('[Vote Service] Starting vote transaction...')
  const voteReceipt = await prismaClient.$transaction(async tx => {
    const nonce = generateNonce()

    const createdAt = new Date()

    const voteHash = generateVoteHash(
      voterToken,
      votingId,
      userSelectedVotingOption.id,
      userSelectedVotingOption.label,
      createdAt,
      nonce,
    )

    const voteSignature = generateReceiptSignature(voteHash, nonce)

    await tx.vote.updateMany({
      where: { votingId, voterToken, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    await tx.vote.create({
      data: {
        votingId,
        voterToken,
        optionId: userSelectedVotingOption.id,
        optionLabel: userSelectedVotingOption.label,
        nonce,
        voteHash,
        voteSignature,
        createdAt,
      },
    })

    return { hash: voteHash, nonce, signature: voteSignature }
  })

  console.info('[Vote Service] Voting process done, sending back the receipt...')
  return voteReceipt
}
