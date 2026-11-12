import { Link, useParams } from 'react-router-dom'
import { PcQuestionCard } from '../components/PcQuestionCard'
import { pcQById } from '../pyq'
import { pcPaperLabel } from '../types'

export default function PcQuestionPage() {
  const { qid = '' } = useParams()
  const q = pcQById(decodeURIComponent(qid))
  if (!q) return <div>Unknown question</div>
  return (
    <div>
      <Link to={`/ce301/papers/${q.paper}`} className="text-sm text-accent">
        ← {pcPaperLabel(q.paper)} paper
      </Link>
      <div className="mt-3">
        <PcQuestionCard q={q} />
      </div>
    </div>
  )
}
