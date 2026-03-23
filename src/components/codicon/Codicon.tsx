import type { HTMLAttributes } from 'react'

/** Renders a VS Code codicon (font glyph from `@vscode/codicons`). Pass the icon id without the `codicon-` prefix. */
export function Codicon({
  name,
  className,
  ...rest
}: { name: string } & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>) {
  return (
    <span
      className={['codicon', `codicon-${name}`, className].filter(Boolean).join(' ')}
      aria-hidden
      {...rest}
    />
  )
}
