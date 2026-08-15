import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { FieldStateContext } from './context'
import { fieldRuntime, markLayoutDirty, type FieldMode } from './runtime'

/**
 * Expõe o estado alvo do campo para a aplicação.
 *
 * O valor de fato consumido pelo loop de animação vive no singleton
 * `fieldRuntime`, não aqui: ele é lido a cada frame e um contexto React nessa
 * frequência re-renderizaria a árvore inteira a 60fps. O que o contexto guarda
 * é só o modo — que muda uma vez por navegação — e o setter. Assim o nav
 * consegue reagir (trocar o contador θ por ∞ em /sobre) sem que o campo pague
 * por isso.
 */
export function FieldStateProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<FieldMode>(fieldRuntime.mode)

  useEffect(() => {
    fieldRuntime.mode = mode
    // A rota nova tem outra árvore: os retângulos protegidos pela repulsão
    // precisam ser remedidos antes do próximo frame.
    markLayoutDirty()
  }, [mode])

  const value = useMemo(() => ({ mode, setMode }), [mode])

  return <FieldStateContext value={value}>{children}</FieldStateContext>
}
