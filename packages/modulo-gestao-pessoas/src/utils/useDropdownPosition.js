import { useEffect, useState } from 'react'

// Positions a dropdown relative to the viewport (not to its anchor), so it
// is never clipped by a scrollable ancestor - the panel/full-screen shell
// here scrolls internally the same way the wizard body does. Recomputed
// whenever it opens, and kept in sync on scroll/resize while open.
export function useDropdownPosition(open, anchorRef) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!open) return
    const update = () => {
      if (!anchorRef.current) return
      const box = anchorRef.current.getBoundingClientRect()
      setRect({
        top: box.bottom + 8,
        left: box.left,
        right: window.innerWidth - box.right,
        width: box.width,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, anchorRef])

  return rect
}
