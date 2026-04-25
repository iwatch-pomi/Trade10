import { tagColor } from '../utils/scoreColors'

interface Props {
  tag?: string
}

export function CandidateTag({ tag }: Props) {
  if (!tag) return null
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${tagColor(tag)}`}>
      {tag}
    </span>
  )
}
