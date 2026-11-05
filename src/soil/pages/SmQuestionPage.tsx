import { Link, useParams } from 'react-router-dom'
import { SmQuestionCard } from '../components/SmQuestionCard'
import { smQById } from '../pyq'

export default function SmQuestionPage() {
  const { qid = '' } = useParams()
  const q = smQById(decodeURIComponent(qid))
  if (!q) return <div className="text-mute">Question not found.</div>
  return (
    <div className="space-y-3">
      <Link to={q.paper === 'own' ? '/ce341' : `/ce341/papers/${q.paper}`} className="text-sm text-accent">
        ← {q.paper === 'own' ? 'overview' : 'whole paper'}
      </Link>
      <SmQuestionCard q={q} defaultOpen />
    </div>
  )
}
