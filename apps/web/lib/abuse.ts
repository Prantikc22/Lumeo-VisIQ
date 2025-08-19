import { get, set } from './redis'
import axios from 'axios'

const ABUSEIPDB_KEY = process.env.ABUSEIPDB_KEY

export async function checkAbuseIP(ip: string) {
  if (!ABUSEIPDB_KEY) {
    return { blocklisted: false }
  }
  const cacheKey = `abuse:${ip}`
  const cached = await get(cacheKey)
  if (cached) return JSON.parse(cached)
  const { data } = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
    params: { ipAddress: ip, maxAgeInDays: 30 },
    headers: { Key: ABUSEIPDB_KEY, Accept: 'application/json' },
  })
  const blocklisted = data.data.abuseConfidenceScore >= 50
  const result = { blocklisted }
  await set(cacheKey, JSON.stringify(result), 86400)
  return result
}
