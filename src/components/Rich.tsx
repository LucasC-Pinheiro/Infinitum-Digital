import type { ElementType } from 'react'

interface RichProps {
  /** Texto do dicionário, que pode conter <em> para o itálico âmbar. */
  text: string
  as?: ElementType
  className?: string
  id?: string
  /** Escalonamento da entrada, lido pelo CSS de `.r`. */
  'data-d'?: string
}

/**
 * Renderiza uma string do dicionário que contém marcação inline.
 *
 * O HTML aqui é sempre conteúdo estático nosso, vindo de src/content — nunca
 * entrada de usuário, nunca resposta de API. Se algum dia esse texto passar a
 * vir de fora, isto precisa virar parsing de verdade.
 */
export function Rich({ text, as: Tag = 'span', className, id, ...rest }: RichProps) {
  return (
    <Tag
      id={id}
      className={className}
      {...rest}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}
