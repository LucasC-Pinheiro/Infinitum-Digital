import { useEffect } from 'react'

/**
 * Revela os elementos `.r` quando entram na viewport, e marca as seções
 * `[data-stroke]` para dispararem o traço contínuo que as atravessa.
 *
 * A marca de "já revelado" é o atributo `data-in`, e não uma classe.
 *
 * Isso não é estilo, é correção de um bug: o observer escreve direto no DOM,
 * fora do React. Num elemento cujo `className` é uma prop que muda (a lista de
 * automação alterna entre `r` e `r on` no hover), a reconciliação reescreve o
 * atributo `class` inteiro e apaga a classe que o observer tinha somado. Como
 * o observer já chamou `unobserve`, ela nunca voltava, e o `.r { opacity: 0 }`
 * ficava valendo para sempre: passar o cursor apagava a linha até dar reload.
 * O React só toca nos atributos que ele mesmo gerencia, então `data-in` — que
 * nenhum componente declara — sobrevive a qualquer re-render.
 */
export function useRevealOnScroll(): void {
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-in', '')
          reveal.unobserve(entry.target)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    )
    document.querySelectorAll('.r').forEach((el) => reveal.observe(el))

    // Limiar mais alto que o dos `.r`: o traço só começa a correr quando a
    // seção já domina a tela, senão ele termina antes de ser visto.
    const strokeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-stroke-in', '')
          strokeObserver.unobserve(entry.target)
        }
      },
      { threshold: 0.2 },
    )
    document.querySelectorAll('[data-stroke]').forEach((el) => strokeObserver.observe(el))

    return () => {
      reveal.disconnect()
      strokeObserver.disconnect()
    }
  }, [])
}
