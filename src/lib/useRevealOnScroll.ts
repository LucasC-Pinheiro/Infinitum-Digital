import { useEffect } from 'react'

/**
 * Revela os elementos `.r` quando entram na viewport, e marca as seções
 * `[data-stroke]` para dispararem o traço contínuo que as atravessa.
 *
 * Um observer só para a página inteira: os elementos `.r` são estáticos (a
 * troca de idioma altera o texto, não os nós), então basta observar uma vez.
 * A classe `.in` é escrita direto no DOM porque o React não reescreve
 * className quando a prop não muda — os dois convivem sem brigar.
 */
export function useRevealOnScroll(): void {
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('in')
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
          entry.target.classList.add('in')
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
