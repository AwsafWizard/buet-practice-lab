import { Link, useParams } from 'react-router-dom'
import { RcQuestionCard } from '../components/RcQuestionCard'
import { rcQById } from '../pyq'

export default function RcQuestionPage() {
  const { qid = '' } = useParams()
  const q = rcQById(decodeURIComponent(qid))
  if (!q) return <div className="text-mute">Question not found.</div>
  return (
    <div className="space-y-3">
      <Link to={q.paper === 'own' ? '/ce315' : `/ce315/papers/${q.paper}`} className="text-sm text-accent">
        ← {q.paper === 'own' ? 'overview' : 'whole paper'}
      </Link>
      <RcQuestionCard q={q} defaultOpen />
    </div>
  )
}
