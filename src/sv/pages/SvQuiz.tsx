// Quiz arena: presets for the two quizzes, or a custom set by topic / kind / size / mode.
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Seg } from '../../components/ui'
import { useStore } from '../../store'
import { INST_POOL, qKey, SV_QUESTIONS } from '../content'
import { pickQuestions, QuizRunner, type QuizMode } from '../components/Quiz'
import { SvTopicIcon } from '../components/icons'
import { SV_TOPICS } from '../registry'
import type { SvQuestion } from '../types'

type Kind = SvQuestion['kind']

export default function SvQuiz() {
  const [params] = useSearchParams()
  const pre = params.get('topic')
  return <QuizArena initialTopics={pre ? [pre] : []} />
}

export function QuizArena({ initialTopics = [], lockTopic }: { initialTopics?: string[]; lockTopic?: string }) {
  const attempts = useStore((s) => s.attempts)
  const [run, setRun] = useState<{ qs: SvQuestion[]; mode: QuizMode; minutes?: number; title: string; key: number } | null>(null)
  const [topics, setTopics] = useState<string[]>(lockTopic ? [lockTopic] : initialTopics)
  const [kinds, setKinds] = useState<Kind[]>(['mcq', 'tf', 'blank'])
  const [n, setN] = useState(15)
  const [mode, setMode] = useState<QuizMode>('practice')
  const [minutes, setMinutes] = useState(15)

  const stats = useMemo(() => {
    const out: Record<string, { total: number; tried: number; right: number }> = {}
    for (const q of SV_QUESTIONS) {
      const o = (out[q.topic] ??= { total: 0, tried: 0, right: 0 })
      o.total++
      const a = attempts[qKey(q)]
      if (a && !a.cleared) {
        o.tried++
        if (a.correct) o.right++
      }
    }
    return out
  }, [attempts])

  if (run) return <QuizRunner key={run.key} questions={run.qs} mode={run.mode} minutes={run.minutes} title={run.title} onExit={() => setRun(null)} />

  const start = (pool: SvQuestion[], count: number, m: QuizMode, title: string, mins?: number) =>
    setRun({ qs: pickQuestions(pool, useStore.getState().attempts, count), mode: m, minutes: m === 'test' ? mins : undefined, title, key: Date.now() })

  const pool = SV_QUESTIONS.filter((q) => (topics.length ? topics.includes(q.topic) : true) && kinds.includes(q.kind))
  const missed = SV_QUESTIONS.filter((q) => {
    const a = attempts[qKey(q)]
    return a && !a.cleared && (!a.correct || !a.firstTry) && (!lockTopic || q.topic === lockTopic)
  })
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <div className="space-y-6">
      {!lockTopic && (
        <div>
          <h1 className="text-2xl font-extrabold">Quiz arena</h1>
          <p className="text-mute text-sm mt-1">
            {SV_QUESTIONS.length} questions from the lecture sheet, the class notes and the 18-batch reports — MCQ, true/false and fill in the blanks (the 18-batch instruments quiz was “objective + blanks”). Missed questions come back first.
          </p>
        </div>
      )}

      {!lockTopic && (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
          <Preset
            title="Instruments quiz"
            sub="25 Nov · 15 marks. 20 questions, 15 minutes, marked at the end."
            accent
            onClick={() => start(INST_POOL(), 20, 'test', 'Instruments quiz (mock)', 15)}
            count={INST_POOL().length}
          />
          <Preset title="Final quiz mix" sub="3 Dec · every field work. 30 questions, 20 minutes, marked at the end." onClick={() => start(SV_QUESTIONS, 30, 'test', 'Final quiz (mock)', 20)} count={SV_QUESTIONS.length} />
          <Preset title="Quick ten" sub="10 questions from everything, feedback after each one." onClick={() => start(SV_QUESTIONS, 10, 'practice', 'Quick ten')} count={SV_QUESTIONS.length} />
          <Preset title="Weak spots" sub="Only the ones you missed or got on a second try." onClick={() => start(missed, 25, 'practice', 'Weak spots')} count={missed.length} disabled={!missed.length} />
        </div>
      )}

      <div className="card p-4 space-y-4">
        <div className="font-bold">{lockTopic ? 'Practise this topic' : 'Build your own'}</div>
        {!lockTopic && (
          <div className="flex flex-wrap gap-1.5">
            {SV_TOPICS.map((t) => {
              const st = stats[t.id] ?? { total: 0, tried: 0, right: 0 }
              const on = topics.includes(t.id)
              return (
                <button key={t.id} type="button" onClick={() => setTopics(toggle(topics, t.id))} className={'rounded-lg border px-2.5 py-1.5 text-xs flex items-center gap-1.5 transition-colors ' + (on ? 'border-accent bg-accent/10' : 'border-line hover:border-accent')}>
                  <SvTopicIcon id={t.id} color={t.color} size={14} />
                  <span className="font-semibold">{t.short}</span>
                  <span className="num text-faint">
                    {st.right}/{st.total}
                  </span>
                </button>
              )
            })}
            {topics.length > 0 && (
              <button className="btn btn-ghost !text-xs" onClick={() => setTopics([])}>
                clear (= all)
              </button>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-mute">Kinds</span>
            {(['mcq', 'tf', 'blank'] as Kind[]).map((k) => (
              <label key={k} className="flex items-center gap-1">
                <input type="checkbox" checked={kinds.includes(k)} onChange={() => setKinds(toggle(kinds, k).length ? toggle(kinds, k) : kinds)} />
                {k === 'mcq' ? 'MCQ' : k === 'tf' ? 'True/false' : 'Blanks'}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-mute">Questions</span>
            <input type="range" min={5} max={Math.max(5, Math.min(60, pool.length))} value={Math.min(n, Math.max(5, pool.length))} onChange={(e) => setN(+e.target.value)} />
            <b className="num w-6">{Math.min(n, pool.length)}</b>
          </div>
          <Seg<QuizMode>
            value={mode}
            onChange={setMode}
            items={[
              { v: 'practice', label: 'Practice (feedback each)' },
              { v: 'test', label: 'Test (timed)' },
            ]}
          />
          {mode === 'test' && (
            <label className="flex items-center gap-1.5">
              <input className="field w-16" type="number" min={1} value={minutes} onChange={(e) => setMinutes(Math.max(1, +e.target.value || 1))} /> min
            </label>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button className="btn btn-primary" disabled={!pool.length} onClick={() => start(pool, n, mode, lockTopic ? 'Topic quiz' : 'Custom quiz', minutes)}>
            Start · {Math.min(n, pool.length)} of {pool.length}
          </button>
          {lockTopic && missed.length > 0 && (
            <button className="btn" onClick={() => start(missed, 25, 'practice', 'Weak spots')}>
              Redo my {missed.length} misses
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Preset({ title, sub, onClick, count, accent, disabled }: { title: string; sub: string; onClick: () => void; count: number; accent?: boolean; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={'card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent disabled:opacity-50 disabled:hover:translate-y-0 ' + (accent ? 'border-accent/60' : '')}>
      <div className={'font-extrabold ' + (accent ? 'text-accent' : '')}>{title}</div>
      <div className="text-xs text-mute mt-1">{sub}</div>
      <div className="text-[11px] text-faint mt-2 num">{count} in the pool</div>
    </button>
  )
}
