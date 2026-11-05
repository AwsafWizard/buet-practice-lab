import { useEffect } from 'react'
import { markUsed } from '../../reference/pane'

/** mark the chart-pane rows a lab used, after render (never during it: two labs on one page must not ping-pong) */
export function useMark(id: string, v: Record<string, number | string>) {
  const k = JSON.stringify(v)
  useEffect(() => markUsed(id, JSON.parse(k)), [id, k])
}
