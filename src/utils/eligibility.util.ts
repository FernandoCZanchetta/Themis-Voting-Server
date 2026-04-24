import { Voting } from '@generated'
import { AuthUser } from '@types'

export function isUserEligible(user: AuthUser, voting: Voting) {
  if (voting.allowedCourses.length > 0) {
    if (user.course && voting.allowedCourses.includes(user.course)) {
      return true
    }
  }

  if (voting.allowedInstitutes.length > 0) {
    if (user.institute && voting.allowedInstitutes.includes(user.institute)) {
      return true
    }
  }

  if (voting.allowedCampi.length > 0) {
    if (user.campus && voting.allowedCampi.includes(user.campus)) {
      return true
    }
  }

  return false
}
