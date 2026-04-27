import { Voting, VotingWhereInput } from '@generated'
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
    /**
    {
      OR: user.campus
        ? [{ allowedCampi: { isEmpty: true } }, { allowedCampi: { has: user.campus } }]
        : [{ allowedCampi: { isEmpty: true } }],
    },
     */
  ]
}

export function isUserEligible(user: AuthUser, voting: Voting) {
  if (voting.allowedCourses.length === 0 && voting.allowedInstitutes.length === 0 && voting.allowedCampi.length === 0) {
    return true
  }

  const eligibleCourse =
    voting.allowedCourses.length === 0 || (!!user.course && voting.allowedCourses.includes(user.course))

  const eligibleInstitute =
    voting.allowedInstitutes.length === 0 || (!!user.institute && voting.allowedInstitutes.includes(user.institute))

  // const eligibleCampus = voting.allowedCampi.length === 0 || !!user.campus && voting.allowedCampi.includes(user.campus)

  return eligibleCourse && eligibleInstitute
}
