type RiskInput = {
  incognito?: boolean
  vpn?: boolean
  timezoneMismatch?: boolean
  webdriver?: boolean
  abuseListed?: boolean
  velocityCount?: number
}

export function computeRisk({ incognito, vpn, timezoneMismatch, webdriver, abuseListed, velocityCount }: RiskInput) {
  let score = 0
  if (incognito) score += 20
  if (vpn) score += 20
  if (timezoneMismatch) score += 15
  if (webdriver) score += 10
  if (abuseListed) score += 10
  if ((velocityCount ?? 0) > 3) score += 5
  score = Math.max(0, Math.min(100, score))
  const verdict = score <= 30 ? 'low' : score <= 70 ? 'medium' : 'high'
  return { score, verdict }
}
