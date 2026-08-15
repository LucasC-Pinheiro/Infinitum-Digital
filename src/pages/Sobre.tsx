import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Rich } from '@/components/Rich'
import { FOUNDERS } from '@/content/about'
import { WHATSAPP_NUMBER } from '@/content/contact'
import { markLayoutDirty } from '@/lib/field/runtime'
import { useFieldState } from '@/lib/field/useFieldState'
import { useLanguage } from '@/lib/i18n/useLanguage'
import { useRevealOnScroll } from '@/lib/useRevealOnScroll'

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

/**
 * /sobre. Editorial, assimétrico, sem contêiner.
 *
 * A página não tem ciclo para percorrer, então fixa o campo na forma de
 * repouso: a lemniscata inteira, mais rarefeita, girando devagar. O contador θ
 * do nav vira ∞ enquanto ela estiver montada, sinalizando que ali não existe
 * posição de scroll.
 *
 * Cada fundador alterna o lado da foto, e o texto avança sobre a coluna da
 * imagem para quebrar a simetria. Nunca duas colunas iguais.
 */
export function Sobre({ onLeave }: { onLeave: () => void }) {
  const { t, lang } = useLanguage()
  const { setMode } = useFieldState()
  const founders = FOUNDERS[lang]

  useRevealOnScroll()

  useEffect(() => {
    setMode('rest')
    window.scrollTo({ top: 0, behavior: 'auto' })
    markLayoutDirty()
    return () => setMode('scroll')
  }, [setMode])

  // Texto novo muda a altura da composição; a repulsão precisa remedir.
  useEffect(() => {
    markLayoutDirty()
  }, [lang])

  return (
    <main id="main">
      <section id="about">
        <DuotoneFilter />

        <div className="head">
          <div className="label r">
            <b>∞</b> <span>{t('aboutLabel')}</span>
          </div>
          <Rich as="h2" className="r" data-d="1" text={t('aboutH')} />
          <p className="body r" data-d="2">
            {t('aboutP')}
          </p>
        </div>

        {founders.map((founder, i) => (
          <article
            key={founder.id}
            className={`founder ${i % 2 === 0 ? 'left' : 'right'}`}
          >
            <img
              className="founderPhoto r"
              src={founder.photo}
              alt={founder.photoAlt}
              width={520}
              height={650}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />

            <div className="founderText r" data-d="1">
              <p className="founderIdx">∞ {String(i + 1).padStart(2, '0')}</p>
              <h3 className="founderName">{founder.name}</h3>
              <p className="founderRole">{founder.role}</p>

              {founder.bio.map((paragraph) => (
                <p
                  key={paragraph}
                  className={founder.todo ? 'founderBio todo' : 'founderBio'}
                >
                  {paragraph}
                </p>
              ))}

              <ul className="ruled founderStack">
                {founder.stack.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}

        <div className="aboutClose">
          <a
            className="magnet r"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{t('ctaBtn')}</span> <span aria-hidden="true">∞</span>
          </a>
          <Link
            className="aboutBack"
            to="/"
            onClick={onLeave}
            // O scroll do topo é responsabilidade da home ao montar; aqui só
            // garantimos que a volta não herde a posição de /sobre.
            state={{ from: 'sobre' }}
          >
            {t('aboutBack')}
          </Link>
        </div>
      </section>
    </main>
  )
}

/**
 * Duotone dos retratos: luminância primeiro, depois uma rampa que sai do
 * grafite, passa pelo âmbar nos meios-tons e fecha no osso. Sombra funde no
 * fundo, a pele fica sob a luz âmbar da marca e a alta-luz volta para o osso.
 * Fica em filtro SVG e não em `filter:` encadeado porque só assim as paradas
 * são os hex exatos dos tokens.
 */
function DuotoneFilter() {
  return (
    <svg className="filterDefs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="duotone" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0      0      0      1 0"
          />
          {/* A primeira parada repete o grafite de propósito: sombra esmagada
              faz o fundo da foto virar exatamente o fundo da página, e é isso
              que dissolve a moldura retangular do retrato. */}
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.047 0.075 0.30 0.58 0.80 0.953" />
            <feFuncG type="table" tableValues="0.047 0.062 0.22 0.45 0.70 0.941" />
            <feFuncB type="table" tableValues="0.051 0.055 0.12 0.28 0.52 0.918" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}
