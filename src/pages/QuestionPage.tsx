import { Link, useParams, useSearchParams } from 'react-router-dom'
import { QuestionCard } from '../components/QuestionCard'
import { pyqById } from '../pyq'

export default function QuestionPage() {
  const { qid = '' } = useParams()
  const q = pyqById(qid)
  const [sp] = useSearchParams()
  if (!q) return <div className="text-mute">Question not found.</div>
  return (
    <div className="space-y-3">
      <Link to={`/papers/${q.paper}`} className="text-sm text-accent">
        ← whole paper
      </Link>
      <QuestionCard q={q} defaultOpen solutionOpen={sp.get('sol') === '1'} />
    </div>
  )
}
