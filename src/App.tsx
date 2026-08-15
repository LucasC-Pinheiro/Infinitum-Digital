import { useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { FieldFallback } from '@/components/FieldFallback'
import { InfinityField } from '@/components/InfinityField'
import { Nav } from '@/components/Nav'
import { SiteFooter } from '@/components/SiteFooter'
import { Home } from '@/pages/Home'
import { Sobre } from '@/pages/Sobre'
import { prefersReducedMotion } from '@/lib/env'
import { FieldStateProvider } from '@/lib/field/FieldStateProvider'
import { markLayoutDirty } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'
import { scrollToHash, scrollToHashOnLoad } from '@/lib/scrollToHash'

/** Espera o scroll suave chegar ao topo antes de trocar o texto do hero. */
const SECOND_PASS_DELAY = 900

export default function App() {
  const { t, lang } = useLanguage()
  const [secondPass, setSecondPass] = useState(false)
  const secondPassRequested = useRef(false)
  const location = useLocation()

  // Texto novo muda a altura das seções; o campo precisa remedir.
  useEffect(() => {
    markLayoutDirty()
  }, [lang])

  /**
   * Âncoras. O React Router não rola para o hash sozinho, então navegar para
   * `/#cta` só trocava a URL e a página ficava onde estava. A primeira
   * passagem é o acesso direto com recarga (salto seco, esperando o layout
   * assentar); as seguintes vêm de clique no nav e rolam suave.
   */
  const seenHash = useRef<string | null>(null)
  useEffect(() => {
    if (!location.hash) {
      seenHash.current = null
      return
    }
    const first = seenHash.current === null
    seenHash.current = location.hash
    if (first) scrollToHashOnLoad(location.hash)
    else scrollToHash(location.hash)
  }, [location.key, location.hash])

  const goHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    if (secondPassRequested.current) return
    secondPassRequested.current = true
    window.setTimeout(
      () => setSecondPass(true),
      prefersReducedMotion ? 0 : SECOND_PASS_DELAY,
    )
  }, [])

  /**
   * Voltar de /sobre para a home também fecha o ciclo: o hero re-talha com a
   * segunda passagem, igual ao clique no contador θ. O salto para o topo é
   * instantâneo porque a rota troca no mesmo gesto, e rolagem suave durante a
   * remontagem faria a home nascer no meio do percurso.
   */
  const armSecondPass = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    if (secondPassRequested.current) return
    secondPassRequested.current = true
    window.setTimeout(
      () => setSecondPass(true),
      prefersReducedMotion ? 0 : SECOND_PASS_DELAY,
    )
  }, [])

  return (
    <FieldStateProvider>
      <a className="skip" href="#main">
        {t('skip')}
      </a>

      {/* O campo vive acima do <Routes> e nunca desmonta: ele é a única coisa
          contínua entre as duas páginas. Desmontá-lo na navegação zeraria a
          posição do morph e a troca de rota viraria um piscar. */}
      <InfinityField />
      <FieldFallback />
      <div id="vignette" aria-hidden="true" />

      <Nav onGoHome={goHome} />

      {/* Só o texto participa da transição; o canvas segue morfando por baixo,
          sem cortar. A key força o fade a rodar de novo a cada rota. */}
      <div className="routeFade" key={location.pathname}>
        <Routes location={location}>
          <Route
            path="/"
            element={<Home secondPass={secondPass} onGoHome={goHome} />}
          />
          <Route path="/sobre" element={<Sobre onLeave={armSecondPass} />} />
          <Route
            path="*"
            element={<Home secondPass={secondPass} onGoHome={goHome} />}
          />
        </Routes>
      </div>

      <SiteFooter />
    </FieldStateProvider>
  )
}
