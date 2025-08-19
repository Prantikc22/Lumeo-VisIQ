import { get, set } from './redis'
import axios from 'axios'

const IPINFO_TOKEN = process.env.IPINFO_TOKEN
if (!IPINFO_TOKEN) throw new Error('IPINFO_TOKEN env var not set')

export async function getIPInfo(ip: string) {
  const cacheKey = `ipinfo:${ip}`
  const cached = await get(cacheKey)
  if (cached) return JSON.parse(cached)

  const url = `https://ipinfo.io/${ip}/json?token=${IPINFO_TOKEN}`
  const { data } = await axios.get(url)
  const result: any = {
    org: data.org,
    city: data.city,
    region: data.region,
    country: data.country,
    timezone: data.timezone,
    privacy: data.privacy ?? {},
  }
  if (data.asn) result.asn = data.asn
  await set(cacheKey, JSON.stringify(result), 86400)
  return result
}
