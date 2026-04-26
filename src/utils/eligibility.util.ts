import { VotingWhereInput } from '@generated'
import { AuthUser } from '@types'

export function buildVotingEligibilityWhereFilter(user: AuthUser): VotingWhereInput[] {
  return [
    {
      OR: user.course
        ? [{ allowedCourses: { isEmpty: true } }, { allowedCourses: { has: user.course } }]
        : [{ allowedCourses: { isEmpty: true } }],
    },
    {
      OR: user.institute
        ? [{ allowedInstitutes: { isEmpty: true } }, { allowedInstitutes: { has: user.institute } }]
        : [{ allowedInstitutes: { isEmpty: true } }],
    },
    {
      OR: user.campus
        ? [{ allowedCampi: { isEmpty: true } }, { allowedCampi: { has: user.campus } }]
        : [{ allowedCampi: { isEmpty: true } }],
    },
  ]
}
