import crypto from 'crypto'

const VOTER_TOKEN_SECRET = process.env.VOTER_TOKEN_SECRET!
const SERVER_SECRET = process.env.SERVER_SECRET!
const RECEIPT_SIGNATURE_SECRET = process.env.RECEIPT_SIGNATURE_SECRET!

export function generateVoterToken(nUSPHash: string, votingId: string) {
  return crypto.createHmac('sha512', VOTER_TOKEN_SECRET).update(`${nUSPHash}:${votingId}`).digest('hex')
}

export function generateNonce() {
  return crypto.randomBytes(16).toString('hex')
}

export function generateVoteHash(voterToken: string, votingId: string, votingOptionId: string, nonce: string) {
  return crypto
    .createHash('sha512')
    .update(`${voterToken}:${votingId}:${votingOptionId}:${nonce}:${SERVER_SECRET}`)
    .digest('hex')
}

export function generateReceiptSignature(voteHash: string, nonce: string) {
  return crypto.createHmac('sha512', RECEIPT_SIGNATURE_SECRET).update(`${voteHash}:${nonce}`).digest('hex')
}

export function safeCompare(str1: string, str2: string) {
  const buff1 = Buffer.from(str1, 'hex')
  const buff2 = Buffer.from(str2, 'hex')

  if (buff1.length !== buff2.length) {
    return false
  }

  return crypto.timingSafeEqual(buff1, buff2)
}
