import { useEffect } from 'react'
import { Rich } from '@/components/Rich'
import { FOUNDERS } from '@/content/about'
import { markLayoutDirty } from '@/lib/field/runtime'
import { useLanguage } from '@/lib/i18n/useLanguage'

/**
 * Quem constrói — estado próprio do ciclo (θ 6/8), em tela cheia.
 *
 * Não é um bloco de conteúdo: é uma composição. Um traço vertical único
 * atravessa a seção e os dois fundadores se penduram nele em alturas
 * diferentes — mesma gramática de "one stroke" da seção Por quê. A assimetria
 * (colunas de peso desigual + deslocamento vertical) é o que impede a leitura
 * de "duas colunas iguais", e o vazio ao redor é composição, não sobra.
 *
 * Nada aqui tem fundo próprio: o texto se apoia direto no campo de partículas,
 * que abre espaço ao redor dele pela repulsão do shader (ver TEXT_SELECTORS
 * em lib/field/layout.ts, estado 6).
 */
export function About() {
  const { t, lang } = useLanguage()
  const founders = FOUNDERS[lang]

  // Texto novo muda a altura da composição; o campo precisa remedir para a
  // repulsão continuar alinhada com os blocos.
  useEffect(() => {
    markLayoutDirty()
  }, [lang])

  return (
    <section id="about" data-state="6" data-stroke>
      <DuotoneFilter />

      <div className="head">
        <div className="label r">
          <b>∞ 245°</b> <span>{t('s6label')}</span>
        </div>
        <Rich as="h2" className="r" data-d="1" text={t('s6h')} />
      </div>

      <div className="builders">
        <div className="spine" aria-hidden="true" />

        {founders.map((founder, i) => (
          <article
            key={founder.id}
            className={`builder b${i + 1} r`}
            data-d={String(i + 2)}
          >
            <img
              className="builderPhoto"
              src={founder.photo}
              alt={founder.photoAlt}
              width={168}
              height={210}
              loading="lazy"
              decoding="async"
            />
            <p className="builderIdx">∞ {String(i + 1).padStart(2, '0')}</p>
            <h3 className="builderName">{founder.name}</h3>
            <p className="builderRole">{founder.role}</p>
            <p className="builderLine">{founder.line}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/**
 * Duotone dos retratos: luminância primeiro, depois uma rampa que sai do
 * grafite, passa pelo âmbar nos meios-tons e fecha no osso. Sombra funde no
 * fundo, a pele fica sob a luz âmbar da marca e a alta-luz volta para o osso —
 * as fotos entram na paleta sem abrir uma terceira cor e sem virar sépia
 * (parar o topo da rampa no âmbar tingia a imagem inteira). Fica em filtro SVG
 * e não em `filter:` encadeado porque só assim as paradas são os hex exatos
 * dos tokens.
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
