import { useLayoutEffect, useRef } from 'react'

const STAT_VALUE_MAX_FONT = 40
const STAT_VALUE_MIN_FONT = 20
const STAT_VALUE_FONT_STEP = 2

// The stat cards have a fixed width (see .colaborador-detail__stat-card) and
// must never grow to fit their value - instead, shrink the value's own
// font-size until it fits the card's fixed width. Re-measures whenever the
// text changes or the card itself is resized (e.g. switching between panel
// and full-screen).
export function useFitStatFontSize(text) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const fit = () => {
      let size = STAT_VALUE_MAX_FONT
      el.style.fontSize = `${size}px`
      while (size > STAT_VALUE_MIN_FONT && el.scrollWidth > el.clientWidth) {
        size -= STAT_VALUE_FONT_STEP
        el.style.fontSize = `${size}px`
      }
    }

    fit()

    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])

  return ref
}
