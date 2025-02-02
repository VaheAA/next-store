import { generateAccessToken } from '../lib/paypal'

test('generates token from paypal', async () => {
  const tokenResponse = await generateAccessToken()

  console.log({ tokenResponse })

  expect(tokenResponse).toBeDefined()
  expect(typeof tokenResponse).toBe('string')
  expect(tokenResponse.length).toBeGreaterThan(0)
})
