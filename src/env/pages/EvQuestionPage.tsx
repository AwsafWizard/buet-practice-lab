import { Link, useParams } from 'react-router-dom'
import { EvQuestionCard } from '../components/EvQuestionCard'
import { evQById } from '../pyq'
import { evPaperLabel } from '../types'

export default function EvQuestionPage() {
  const { qid = '' } = useParams()
  const q = evQById(decodeURIComponent(qid))
  if (!q) return <div>Unknown question</div>
  return (
    <div>
      <Link to={`/ce331/papers/${q.paper}`} className="text-sm text-accent">
        ← {evPaperLabel(q.paper)} paper
      </Link>
      <div className="mt-3">
        <EvQuestionCard q={q} />
      </div>
    </div>
  )
}
