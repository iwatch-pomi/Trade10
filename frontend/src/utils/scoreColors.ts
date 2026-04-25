export function scoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
  if (score >= 65) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  if (score >= 50) return 'bg-orange-100 text-orange-800 border-orange-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

export function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 65) return 'bg-yellow-500'
  if (score >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

export function tagColor(tag?: string): string {
  if (tag === '10x候補') return 'bg-purple-100 text-purple-800 border-purple-300'
  if (tag === '2x候補') return 'bg-blue-100 text-blue-800 border-blue-300'
  return ''
}
