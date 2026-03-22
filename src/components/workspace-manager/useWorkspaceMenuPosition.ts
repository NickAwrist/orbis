import { useLayoutEffect, useState, type RefObject } from 'react'

const MENU_MIN_W = 180

export function useWorkspaceMenuPosition(
  menuOpenId: string | null,
  triggerRef: RefObject<HTMLButtonElement | null>,
  menuRef: RefObject<HTMLDivElement | null>,
) {
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!menuOpenId || !triggerRef.current) return

    const update = () => {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const mh = menu?.offsetHeight ?? 96
      const mw = Math.max(menu?.offsetWidth ?? MENU_MIN_W, MENU_MIN_W)
      const gap = 6
      let top = rect.bottom + gap
      if (top + mh > window.innerHeight - 8) {
        top = rect.top - mh - gap
      }
      top = Math.max(8, Math.min(top, window.innerHeight - mh - 8))
      let left = rect.right - mw
      left = Math.max(8, Math.min(left, window.innerWidth - mw - 8))
      setCoords({ top, left })
    }

    update()

    const ro = new ResizeObserver(() => update())
    const attachMenu = () => {
      if (menuRef.current) ro.observe(menuRef.current)
    }
    attachMenu()
    const raf = requestAnimationFrame(() => {
      update()
      attachMenu()
    })

    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [menuOpenId, triggerRef, menuRef])

  return coords
}
