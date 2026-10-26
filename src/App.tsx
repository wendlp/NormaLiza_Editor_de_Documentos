import { useState, type ReactNode } from 'react'

type Standard = 'ABNT' | 'APA' | 'IEEE' | 'Vancouver' | 'MLA'
type IconName =
  | 'book'
  | 'check'
  | 'chevron'
  | 'download'
  | 'file'
  | 'info'
  | 'lock'
  | 'more'
  | 'plus'
  | 'quote'
  | 'search'
  | 'sparkle'
  | 'upload'
  | 'warning'

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

function AppHeader({ standard, setStandard }: { standard: Standard; setStandard: (s: Standard) => void }) {
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
          <Button kind="primary" onClick={() => setExportOpen(!exportOpen)}><Icon name="download" size={16} /> Exportar <Icon name="chevron" size={14} /></Button>
          {exportOpen && (
            <div className="export-menu">
              {['.docx · Microsoft Word', '.pdf · PDF pronto', '.tex · Código LaTeX', '.txt · Texto puro'].map((item) => <button key={item}>{item}</button>)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function Toolbar({ standard }: { standard: Standard }) {
  return (
    <div className="toolbar">
      <select aria-label="Estilo de bloco"><option>Parágrafo</option><option>Título 1</option><option>Título 2</option><option>Citação longa</option><option>Nota de rodapé</option></select>
      <span className="divider" />
      <button className="tool strong">B</button>
      <button className="tool italic">I</button>
      <button className="tool caps">AA</button>
      <span className="divider" />
      <button className="tool-label"><Icon name="quote" size={16} /> Citação</button>
      <button className="tool-label equation">∑ <span>Equação</span></button>
      <div className="rule-indicator"><span>{standard}</span>{standardDetails[standard]}</div>
    </div>
  )
}

function DocumentNav() {
  return (
    <aside className="document-nav">
      <div className="side-title"><span>ESTRUTURA</span><button><Icon name="plus" size={15} /></button></div>
      <nav>
        <button className="active"><span>01</span> Introdução</button>
        <button><span>02</span> Desenvolvimento</button>
        <button><span>03</span> Metodologia</button>
        <button><span>04</span> Considerações finais</button>
        <button><span>05</span> Referências</button>
      </nav>
      <div className="page-count"><Icon name="file" size={15} /><span><strong>1 página</strong> · 246 palavras</span></div>
    </aside>
  )
}

function Paper({ standard }: { standard: Standard }) {
  return (
    <main className="canvas">
      <div className="canvas-top"><span>PÁGINA 1 DE 1</span><button><Icon name="more" /></button></div>
      <article className={`paper paper--${standard.toLowerCase()}`} contentEditable suppressContentEditableWarning>
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

function Assistant({ standard }: { standard: Standard }) {
  const [tab, setTab] = useState<'norma' | 'texto' | 'guia'>('norma')
  return (
    <aside className="assistant">
      <div className="assistant-heading"><div><Icon name="sparkle" /><span><strong>Assistente</strong><small>Análise em tempo real</small></span></div><span className="live-dot">Ativo</span></div>
      <div className="tabs">
        <button className={tab === 'norma' ? 'active' : ''} onClick={() => setTab('norma')}>Norma</button>
        <button className={tab === 'texto' ? 'active' : ''} onClick={() => setTab('texto')}>Ortografia</button>
        <button className={tab === 'guia' ? 'active' : ''} onClick={() => setTab('guia')}>Guia</button>
      </div>
      {tab === 'norma' && <div className="feedback-list">
        <p className="analysis-label">CONFORMIDADE {standard}<span>2 de 3</span></p>
        <div className="progress"><i /></div>
        <article className="feedback success"><span><Icon name="check" /></span><div><strong>Formatação correta</strong><p>Margens, fonte e espaçamento estão de acordo com a norma.</p></div></article>
        <article className="feedback warning"><span><Icon name="warning" /></span><div><strong>Ano ausente na citação</strong><p>A citação no 3º parágrafo precisa incluir o ano da obra.</p><button>Corrigir para (SILVA, 2024)</button></div></article>
        <article className="feedback tip"><span><Icon name="info" /></span><div><strong>Dica {standard}</strong><p>Títulos de seções não levam ponto final e devem usar numeração progressiva.</p></div></article>
      </div>}
      {tab === 'texto' && <div className="empty-state"><Icon name="check" size={24} /><strong>Texto revisado</strong><p>Nenhum erro ortográfico encontrado nesta página.</p></div>}
      {tab === 'guia' && <div className="guide"><p>CONSULTA RÁPIDA</p>{['Como citar um livro', 'Como citar um site', 'Figuras e tabelas', 'Lista de referências'].map(item => <button key={item}>{item}<span>→</span></button>)}</div>}
      <div className="assistant-footer"><Icon name="sparkle" size={15} /> Revisado há poucos segundos</div>
    </aside>
  )
}

export default function App() {
  const [standard, setStandard] = useState<Standard>('ABNT')
  const [showModal, setShowModal] = useState(true)
  return (
    <div className="app-shell">
      <AppHeader standard={standard} setStandard={setStandard} />
      <Toolbar standard={standard} />
      <div className="workspace">
        <DocumentNav />
        <Paper standard={standard} />
        <Assistant standard={standard} />
      </div>
      {showModal && <EntryModal selected={standard} setSelected={setStandard} onCreate={() => setShowModal(false)} />}
    </div>
  )
}
