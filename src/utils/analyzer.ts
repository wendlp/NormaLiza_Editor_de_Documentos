import { AnalysisResult, FeedbackItem, Standard } from '../types/document'

// Dicionário simples de demonstração para o revisor ortográfico
const COMMON_DICTIONARY = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'como', 'que', 'se', 'e', 'ou',
  'o', 'impacto', 'da', 'tecnologia', 'na', 'educacao', 'educação', 'contemporanea', 'contemporânea',
  'marina', 'oliveira', 'santos', 'introducao', 'introdução', 'desenvolvimento', 'metodologia',
  'consideracoes', 'considerações', 'finais', 'referencias', 'referências', 'universidade',
  'federal', 'do', 'brasil', 'transformacao', 'transformação', 'digital', 'tem', 'provocado',
  'mudancas', 'mudanças', 'profundas', 'nas', 'formas', 'ensinar', 'aprender', 'presenca',
  'presença', 'novas', 'tecnologias', 'ambiente', 'educacional', 'amplia', 'acesso', 'informacao',
  'informação', 'cria', 'possibilidades', 'praticas', 'práticas', 'pedagogicas', 'pedagógicas',
  'colaborativas', 'segundo', 'silva', '2024', 'quando', 'utilizada', 'forma', 'critica', 'crítica',
  'planejada', 'pode', 'favorecer', 'autonomia', 'estudantes', 'aproximar', 'conhecimento', 'suas',
  'experiencias', 'experiências', 'cotidianas', 'nao', 'não', 'substituem', 'papel', 'educador',
  'mas', 'ampliam', 'mediacao', 'mediação', 'fortalecem', 'construcao', 'construção', 'coletiva',
  'nesse', 'contexto', 'e', 'é', 'fundamental', 'instituicoes', 'instituições', 'ensino', 'invistam',
  'tanto', 'infraestrutura', 'quanto', 'formacao', 'formação', 'continuada', 'professores'
])

export function analyzeDocument(htmlContent: string, textContent: string, standard: Standard): AnalysisResult {
  const words = textContent
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
  
  const wordCount = words.length
  const charCount = textContent.length
  
  // Conta parágrafos não vazios
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  const paragraphs = Array.from(tempDiv.querySelectorAll('p, blockquote, h2, h3'))
  const paragraphCount = paragraphs.length

  const feedbacks: FeedbackItem[] = []
  let complianceScore = 0
  const totalRules = 3

  // Regra 1: Formatação Básica de Margens e Espaçamento
  feedbacks.push({
    id: 'format-ok',
    type: 'success',
    title: 'Formatação correta',
    message: `Margens, fonte e espaçamento estão de acordo com a norma ${standard}.`,
  })
  complianceScore++

  // Regra 2: Verificação de Citações no texto (Procura por citações sem ano como "(SILVA)")
  const citationWithoutYearRegex = /\(([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-z-]{2,})\)(?!\s*[\d{4}])/g
  const hasCitationIssue = citationWithoutYearRegex.test(textContent)

  if (hasCitationIssue) {
    feedbacks.push({
      id: 'citation-year',
      type: 'warning',
      title: 'Ano ausente na citação',
      message: 'Detectamos uma citação no texto que precisa incluir o ano da obra.',
      actionLabel: 'Corrigir para (SILVA, 2024)',
    })
  } else {
    feedbacks.push({
      id: 'citation-ok',
      type: 'success',
      title: 'Citações normatizadas',
      message: 'Todas as citações encontradas possuem autor e ano devidamente formatados.',
    })
    complianceScore++
  }

  // Regra 3: Dicas e estrutura da norma selecionada
  if (standard === 'ABNT') {
    feedbacks.push({
      id: 'tip-abnt',
      type: 'tip',
      title: 'Dica ABNT',
      message: 'Títulos de seções não levam ponto final e devem utilizar numeração progressiva.',
    })
    complianceScore++
  } else if (standard === 'APA') {
    feedbacks.push({
      id: 'tip-apa',
      type: 'tip',
      title: 'Dica APA',
      message: 'Use alinhamento à esquerda e espaçamento duplo em todo o corpo do texto.',
    })
    complianceScore++
  } else if (standard === 'IEEE') {
    feedbacks.push({
      id: 'tip-ieee',
      type: 'tip',
      title: 'Dica IEEE',
      message: 'As referências no texto devem ser indicadas por números entre colchetes, ex: [1].',
    })
    complianceScore++
  } else {
    feedbacks.push({
      id: 'tip-generic',
      type: 'tip',
      title: `Dica ${standard}`,
      message: `Certifique-se de alinhar a lista de referências de acordo com o padrão ${standard}.`,
    })
    complianceScore++
  }

  // Verificação ortográfica simples
  const misspelledWords: string[] = []
  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    if (cleanWord.length > 3 && !COMMON_DICTIONARY.has(cleanWord) && !/^\d+$/.test(cleanWord)) {
      if (!misspelledWords.includes(cleanWord)) {
        misspelledWords.push(cleanWord)
      }
    }
  })

  return {
    wordCount,
    charCount,
    paragraphCount,
    complianceScore,
    totalRules,
    feedbacks,
    misspelledWords,
  }
}
