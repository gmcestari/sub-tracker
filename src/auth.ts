import { sign } from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from './constants'
import { User } from './entity/User'

export const createTokens = (user: User) => {
  const refreshToken = sign(
    { userId: user.id, count: user.count },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    }
  )
  const accessToken = sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15min',
  })

  return { refreshToken, accessToken }
}
