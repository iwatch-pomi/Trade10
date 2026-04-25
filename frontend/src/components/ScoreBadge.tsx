import { scoreColor } from '../utils/scoreColors'

interface Props {
  score: number
  size?: 'sm' | 'md'
}

export function ScoreBadge({ score, size = 'md' }: Props) {
  const cls = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'
  return (
    <span className={`inline-block font-bold rounded border ${cls} ${scoreColor(score)}`}>
      {score.toFixed(0)}
    </span>
  )
}
