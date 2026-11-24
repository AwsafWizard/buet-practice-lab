// Viva deck: every oral question as a flashcard, by topic or all together.
import { useMemo, useState } from 'react'
import { cardKey, SV_CARDS } from '../content'
import { Flashcards, type DeckCard } from '../components/Flashcards'
import { SvTopicIcon } from '../components/icons'
import { SV_TOPICS } from '../registry'

export const deckOf = (topic?: string): DeckCard[] => SV_CARDS.filter((c) => !topic || c.topic === topic).map((c) => ({ id: cardKey(c), topic: c.topic, front: c.front, back: c.back, src: c.src }))

export default function SvViva() {
  const [topic, setTopic] = useState<string>('')
  const pool = useMemo(() => deckOf(topic || undefined), [topic])
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Viva deck</h1>
        <p className="text-mute text-sm mt-1">
          The questions examiners ask at the instrument and over your sheet on 3 Dec (practical & oral, 60 marks with the final quiz). Say the answer out loud before you flip — the viva is spoken.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button className={'rounded-lg border px-2.5 py-1.5 text-xs font-semibold ' + (!topic ? 'border-accent bg-accent/10' : 'border-line')} onClick={() => setTopic('')}>
          All · {SV_CARDS.length}
        </button>
        {SV_TOPICS.map((t) => (
          <button key={t.id} className={'rounded-lg border px-2.5 py-1.5 text-xs flex items-center gap-1.5 ' + (topic === t.id ? 'border-accent bg-accent/10' : 'border-line hover:border-accent')} onClick={() => setTopic(t.id)}>
            <SvTopicIcon id={t.id} color={t.color} size={14} />
            {t.short} <span className="num text-faint">{SV_CARDS.filter((c) => c.topic === t.id).length}</span>
          </button>
        ))}
      </div>
      <Flashcards pool={pool} showTopic={!topic} />
    </div>
  )
}
