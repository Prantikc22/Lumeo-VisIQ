import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL
if (!redisUrl) throw new Error('REDIS_URL env var not set')
export const redis = new Redis(redisUrl)

export async function get(key: string): Promise<string | null> {
  return redis.get(key)
}

export async function set(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (ttlSeconds) {
    await redis.set(key, value, 'EX', ttlSeconds)
  } else {
    await redis.set(key, value)
  }
}

/**
 * Token bucket rate limiting using Redis.
 * @param key Redis key
 * @param capacity Max tokens in bucket (default 60)
 * @param refillPerSec Tokens added per second (default 1)
 * @returns { allowed: boolean, remaining: number }
 */
export async function tokenBucket(key: string, capacity = 60, refillPerSec = 1): Promise<{ allowed: boolean, remaining: number }> {
  const now = Math.floor(Date.now() / 1000)
  const bucketKey = `tb:${key}`
  const lua = `
    local bucket = redis.call('HMGET', KEYS[1], 'tokens', 'last')
    local tokens = tonumber(bucket[1]) or ARGV[2]
    local last = tonumber(bucket[2]) or ARGV[3]
    local now = tonumber(ARGV[1])
    local refill = (now - last) * ARGV[4]
    tokens = math.min(tokens + refill, ARGV[2])
    local allowed = 0
    if tokens >= 1 then
      tokens = tokens - 1
      allowed = 1
    end
    redis.call('HMSET', KEYS[1], 'tokens', tokens, 'last', now)
    redis.call('EXPIRE', KEYS[1], 3600)
    return {allowed, tokens}
  `
  const result = await redis.eval(lua, 1, bucketKey, now, capacity, now, refillPerSec) as unknown;
  const [allowed, remaining] = Array.isArray(result) ? result : [undefined, undefined];
  return { allowed: !!allowed, remaining: Number(remaining) }
}
