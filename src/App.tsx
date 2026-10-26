import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Standard, Section } from './types/document'
import { analyzeDocument } from './utils/analyzer'
import { exportToDocx, exportToPdf, exportToTex, exportToTxt } from './utils/exporter'

type IconName =
  | 'book' | 'check' | 'chevron' | 'download' | 'file'
  | 'info' | 'lock' | 'more' | 'plus' | 'quote'
  | 'search' | 'sparkle' | 'upload' | 'warning'

const standards: { id: Standard; title: string; note: string }[] = [
  { id: 'ABNT', title: 'ABNT', note: 'Brasil · Acadêmico' },
  { id: 'APA', title: 'APA', note: 'Humanas · Psicologia' },
  { id: 'IEEE', title: 'IEEE', note: 'Tecnologia · Engenharia' },
  { id: 'Vancouver', title: 'Vancouver', note: 'Saúde · Medicina' },
  { id: 'MLA', title: 'MLA', note: 'Literatura · Humanidades' },
]

const standardDetails: Record<Standard, string> = {
  ABNT: 'Arial 12 pt · Espaçamento 1,5 · Justificado',
  APA: 'Times 12 pt · Espaçamento 2,0 · À esquerda',
  IEEE: 'Times 10 pt · Espaçamento simples · 2 colunas',
  Vancouver: 'Arial 12 pt · Espaçamento 1,5 · Justificado',
  MLA: 'Times 12 pt · Espaçamento 2,0 · À esquerda',
}

const initialSections: Section[] = [
  { id: 'sec-1', title: 'Introdução', order: 1 },
  { id: 'sec-2', title: 'Desenvolvimento', order: 2 },
  { id: 'sec-3', title: 'Metodologia', order: 3 },
  { id: 'sec-4', title: 'Considerações finais', order: 4 },
  { id: 'sec-5', title: 'Referências', order: 5 },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v15h4.5a2.5 2.5 0 0 1 2.5 2.5z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    quote: <><path d="M9 11H5a4 4 0 0 1 4-4v9H5" /><path d="M19 11h-4a4 4 0 0 1 4-4v9h-4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sparkle: <><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9z" /><path d="m5 15 .7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7z" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    warning: <><path d="M10.3 3.9 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function Button({ children, kind = 'secondary', onClick }: { children: ReactNode; kind?: 'primary' | 'secondary' | 'ghost'; onClick?: () => void }) {
  return <button className={`button button--${kind}`} onClick={onClick}>{children}</button>
}

function EntryModal({ selected, setSelected, onCreate }: { selected: Standard; setSelected: (s: Standard) => void; onCreate: () => void }) {
  return (
    <div className="modal-layer">
      <section className="entry-modal" aria-modal="true" role="dialog">
        <div className="modal-heading">
          <div className="brand-mark"><Icon name="book" size={22} /></div>
          <div>
            <h1>Novo documento normatizado</h1>
            <p>Escolha o padrão para aplicar a formatação automática.</p>
          </div>
        </div>
        <div className="standard-grid">
          {standards.map((standard) => (
            <button
              className={`standard-card ${selected === standard.id ? 'is-selected' : ''}`}
              key={standard.id}
              onClick={() => setSelected(standard.id)}
            >
              <span className="standard-card__top">
                <span className="standard-monogram">{standard.id.slice(0, 1)}</span>
                <span className="radio"><span /></span>
              </span>
              <strong>{standard.title}</strong>
              <small>{standard.note}</small>
            </button>
          ))}
        </div>
        <button className="dropzone">
          <span className="upload-icon"><Icon name="upload" /></span>
          <span><strong>Ou importe um arquivo existente</strong><small>Arraste aqui ou selecione · .docx, .txt, .tex</small></span>
        </button>
        <div className="modal-footer">
          <span><Icon name="lock" size={14} /> Seus arquivos nunca saem deste dispositivo</span>
          <Button kind="primary" onClick={onCreate}>Criar documento <span>→</span></Button>
        </div>
      </section>
    </div>
  )
}

function AppHeader({
  standard,
  setStandard,
  onExport,
}: {
  standard: Standard
  setStandard: (s: Standard) => void
  onExport: (type: 'docx' | 'pdf' | 'tex' | 'txt') => void
}) {
  const [exportOpen, setExportOpen] = useState(false)
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark brand-mark--small"><Icon name="book" size={17} /></div>
        <span>Norma<span>Liza</span></span>
        <div className="privacy"><Icon name="lock" size={12} /> 100% local <i /> Sem servidor</div>
      </div>
      <label className="standard-select">
        <span>Norma:</span>
        <select value={standard} onChange={(event) => setStandard(event.target.value as Standard)}>
          {standards.map((item) => <option key={item.id}>{item.id}</option>)}
        </select>
        <Icon name="chevron" size={15} />
      </label>
      <div className="header-actions">
        <Button><Icon name="upload" size={16} /> Importar</Button>
        <div className="export-wrap">
          <Button kind="primary" onClick={() => setExportOpen(!exportOpen)}>
            <Icon name="download" size={16} /> Exportar <Icon name="chevron" size={14} />
          </Button>
          {exportOpen && (
            <div className="export-menu">
              <button onClick={() => { onExport('docx'); setExportOpen(false) }}>.docx · Microsoft Word</button>
              <button onClick={() => { onExport('pdf'); setExportOpen(false) }}>.pdf · PDF pronto</button>
              <button onClick={() => { onExport('tex'); setExportOpen(false) }}>.tex · Código LaTeX</button>
              <button onClick={() => { onExport('txt'); setExportOpen(false) }}>.txt · Texto puro</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function Toolbar({
  standard,
  onFormat,
  onBlockChange,
}: {
  standard: Standard
  onFormat: (command: string, value?: string) => void
  onBlockChange: (tag: string) => void
}) {
  return (
    <div className="toolbar">
      <select aria-label="Estilo de bloco" onChange={(e) => onBlockChange(e.target.value)}>
        <option value="p">Parágrafo</option>
        <option value="h3">Título da Seção</option>
        <option value="blockquote">Citação longa</option>
      </select>
      <span className="divider" />
      <button className="tool strong" onClick={() => onFormat('bold')}>B</button>
      <button className="tool italic" onClick={() => onFormat('italic')}>I</button>
      <button className="tool caps" onClick={() => onFormat('uppercase')}>AA</button>
      <span className="divider" />
      <button className="tool-label" onClick={() => onBlockChange('blockquote')}>
        <Icon name="quote" size={16} /> Citação
      </button>
      <button className="tool-label equation" onClick={() => onFormat('insertText', ' ∑ ')}>
        ∑ <span>Equação</span>
      </button>
      <div className="rule-indicator">
        <span>{standard}</span>{standardDetails[standard]}
      </div>
    </div>
  )
}

function DocumentNav({
  sections,
  activeSection,
  onSelectSection,
  onAddSection,
  wordCount,
}: {
  sections: Section[]
  activeSection: string
  onSelectSection: (title: string) => void
  onAddSection: () => void
  wordCount: number
}) {
  return (
    <aside className="document-nav">
      <div className="side-title">
        <span>ESTRUTURA</span>
        <button onClick={onAddSection} title="Nova Seção"><Icon name="plus" size={15} /></button>
      </div>
      <nav>
        {sections.map((sec, idx) => (
          <button
            key={sec.id}
            className={activeSection === sec.title ? 'active' : ''}
            onClick={() => onSelectSection(sec.title)}
          >
            <span>0{idx + 1}</span> {sec.title}
          </button>
        ))}
      </nav>
      <div className="page-count">
        <Icon name="file" size={15} />
        <span><strong>1 página</strong> · {wordCount} palavras</span>
      </div>
    </aside>
  )
}

function Paper({
  standard,
  paperRef,
  onInput,
}: {
  standard: Standard
  paperRef: React.RefObject<HTMLDivElement | null>
  onInput: () => void
}) {
  return (
    <main className="canvas">
      <div className="canvas-top">
        <span>PÁGINA 1 DE 1</span>
        <button><Icon name="more" /></button>
      </div>
      <article
        ref={paperRef}
        className={`paper paper--${standard.toLowerCase()}`}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
      >
        <p className="paper-kicker">UNIVERSIDADE FEDERAL DO BRASIL</p>
        <h2>O IMPACTO DA TECNOLOGIA NA EDUCAÇÃO CONTEMPORÂNEA</h2>
        <p className="author">Marina Oliveira Santos</p>
        <h3>1 INTRODUÇÃO</h3>
        <p>A transformação digital tem provocado mudanças profundas nas formas de ensinar e aprender. A presença de novas tecnologias no ambiente educacional amplia o acesso à informação e cria possibilidades para práticas pedagógicas mais colaborativas.</p>
        <p>Segundo Silva (2024), a tecnologia, quando utilizada de forma crítica e planejada, pode favorecer a autonomia dos estudantes e aproximar o conhecimento de suas experiências cotidianas.</p>
        <blockquote>As tecnologias digitais não substituem o papel do educador, mas ampliam suas possibilidades de mediação e fortalecem a construção coletiva do conhecimento.</blockquote>
        <h3>2 DESENVOLVIMENTO</h3>
        <p>Nesse contexto, é fundamental que instituições de ensino invistam tanto em infraestrutura quanto na formação continuada de professores.</p>
      </article>
    </main>
  )
}

function Assistant({
  standard,
  analysis,
  onFixCitation,
}: {
  standard: Standard
  analysis: ReturnType<typeof analyzeDocument>
  onFixCitation: () => void
}) {
  const [tab, setTab] = useState<'norma' | 'texto' | 'guia'>('norma')

  return (
    <aside className="assistant">
      <div className="assistant-heading">
        <div>
          <Icon name="sparkle" />
          <span><strong>Assistente</strong><small>Análise em tempo real</small></span>
        </div>
        <span className="live-dot">Ativo</span>
      </div>
      <div className="tabs">
        <button className={tab === 'norma' ? 'active' : ''} onClick={() => setTab('norma')}>Norma</button>
        <button className={tab === 'texto' ? 'active' : ''} onClick={() => setTab('texto')}>Ortografia</button>
        <button className={tab === 'guia' ? 'active' : ''} onClick={() => setTab('guia')}>Guia</button>
      </div>

      {tab === 'norma' && (
        <div className="feedback-list">
          <p className="analysis-label">
            CONFORMIDADE {standard}
            <span>{analysis.complianceScore} de {analysis.totalRules}</span>
          </p>
          <div className="progress">
            <i style={{ width: `${(analysis.complianceScore / analysis.totalRules) * 100}%` }} />
          </div>
          {analysis.feedbacks.map((item) => (
            <article key={item.id} className={`feedback ${item.type}`}>
              <span>
                <Icon name={item.type === 'success' ? 'check' : item.type === 'warning' ? 'warning' : 'info'} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                {item.actionLabel && <button onClick={onFixCitation}>{item.actionLabel}</button>}
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'texto' && (
        <div className="feedback-list">
          {analysis.misspelledWords.length === 0 ? (
            <div className="empty-state">
              <Icon name="check" size={24} />
              <strong>Texto revisado</strong>
              <p>Nenhum erro ortográfico encontrado nesta página.</p>
            </div>
          ) : (
            <div>
              <p className="analysis-label">PALAVRAS A REVISAR <span>{analysis.misspelledWords.length}</span></p>
              {analysis.misspelledWords.map((word) => (
                <article key={word} className="feedback warning">
                  <span><Icon name="warning" /></span>
                  <div>
                    <strong>{word}</strong>
                    <p>Verifique a grafia ou acentuação desta palavra no texto.</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'guia' && (
        <div className="guide">
          <p>CONSULTA RÁPIDA</p>
          {['Como citar um livro', 'Como citar um site', 'Figuras e tabelas', 'Lista de referências'].map((item) => (
            <button key={item}>{item}<span>→</span></button>
          ))}
        </div>
      )}

      <div className="assistant-footer">
        <Icon name="sparkle" size={15} /> Revisado em tempo real
      </div>
    </aside>
  )
}

export default function App() {
  const [standard, setStandard] = useState<Standard>('ABNT')
  const [showModal, setShowModal] = useState(true)
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSection, setActiveSection] = useState('Introdução')
  const paperRef = useRef<HTMLDivElement>(null)

  const [analysis, setAnalysis] = useState(() =>
    analyzeDocument('', '', 'ABNT')
  )

  const handleDocumentChange = () => {
    if (paperRef.current) {
      const html = paperRef.current.innerHTML
      const text = paperRef.current.innerText || ''
      setAnalysis(analyzeDocument(html, text, standard))
    }
  }

  useEffect(() => {
    handleDocumentChange()
  }, [standard])

  const handleFormat = (command: string, value: string | undefined = undefined) => {
    if (command === 'uppercase') {
      const sel = window.getSelection()
      if (sel && sel.toString()) {
        document.execCommand('insertText', false, sel.toString().toUpperCase())
      }
    } else {
      document.execCommand(command, false, value)
    }
    handleDocumentChange()
  }

  const handleBlockChange = (tag: string) => {
    document.execCommand('formatBlock', false, `<${tag}>`)
    handleDocumentChange()
  }

  const handleSelectSection = (title: string) => {
    setActiveSection(title)
    if (!paperRef.current) return

    const headings = Array.from(paperRef.current.querySelectorAll('h3, h2'))
    const target = headings.find((h) => h.textContent?.toLowerCase().includes(title.toLowerCase()))

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleAddSection = () => {
    const title = prompt('Nome da nova seção:')
    if (title) {
      const newSec: Section = {
        id: `sec-${Date.now()}`,
        title,
        order: sections.length + 1,
      }
      setSections([...sections, newSec])
      if (paperRef.current) {
        paperRef.current.innerHTML += `<h3>${sections.length + 1} ${title.toUpperCase()}</h3><p>Digite o texto da seção aqui...</p>`
        handleDocumentChange()
      }
    }
  }

  const handleFixCitation = () => {
    if (paperRef.current) {
      paperRef.current.innerHTML = paperRef.current.innerHTML.replace('(SILVA)', '(SILVA, 2024)')
      handleDocumentChange()
    }
  }

  const handleExport = (type: 'docx' | 'pdf' | 'tex' | 'txt') => {
    if (!paperRef.current) return
    const html = paperRef.current.innerHTML
    const text = paperRef.current.innerText || ''

    if (type === 'docx') exportToDocx(html, standard)
    if (type === 'pdf') exportToPdf()
    if (type === 'tex') exportToTex(html, standard)
    if (type === 'txt') exportToTxt(text)
  }

  return (
    <div className="app-shell">
      <AppHeader standard={standard} setStandard={setStandard} onExport={handleExport} />
      <Toolbar standard={standard} onFormat={handleFormat} onBlockChange={handleBlockChange} />
      <div className="workspace">
        <DocumentNav
          sections={sections}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onAddSection={handleAddSection}
          wordCount={analysis.wordCount}
        />
        <Paper standard={standard} paperRef={paperRef} onInput={handleDocumentChange} />
        <Assistant standard={standard} analysis={analysis} onFixCitation={handleFixCitation} />
      </div>
      {showModal && (
        <EntryModal selected={standard} setSelected={setStandard} onCreate={() => setShowModal(false)} />
      )}
    </div>
  )
}
