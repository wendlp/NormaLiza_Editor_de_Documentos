import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { Standard } from '../types/document'

/**
 * Exporta o conteúdo como Texto Puro (.txt)
 */
export function exportToTxt(textContent: string, filename = 'documento-normalizado.txt') {
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

/**
 * Exporta o conteúdo formatado em código LaTeX (.tex)
 */
export function exportToTex(htmlContent: string, standard: Standard, filename = 'documento.tex') {
  const temp = document.createElement('div')
  temp.innerHTML = htmlContent

  let texBody = ''
  temp.childNodes.forEach((node) => {
    const el = node as HTMLElement
    if (!el.tagName) return

    const text = el.innerText || el.textContent || ''

    switch (el.tagName.toLowerCase()) {
      case 'h2':
        texBody += `\\title{${text}}\n\\maketitle\n\n`
        break
      case 'h3':
        texBody += `\\section{${text}}\n`
        break
      case 'blockquote':
        texBody += `\\begin{quote}\n${text}\n\\end{quote}\n\n`
        break
      case 'p':
        if (el.classList.contains('paper-kicker')) {
          texBody += `% ${text}\n`
        } else if (el.classList.contains('author')) {
          texBody += `\\author{${text}}\n`
        } else {
          texBody += `${text}\n\n`
        }
        break
    }
  })

  const texDocument = `\\documentclass[12pt]{article}
\\usepackage[utf8]{utf8}
\\usepackage[brazil]{babel}
\\usepackage{geometry}
\\geometry{a4paper, margin=3cm}

% Documento gerado via NormaLiza (${standard})

\\begin{document}

${texBody}

\\end{document}`

  const blob = new Blob([texDocument], { type: 'text/x-tex;charset=utf-8' })
  saveAs(blob, filename)
}

/**
 * Exporta o documento para PDF usando a caixa de diálogo nativa do navegador
 */
export function exportToPdf() {
  window.print()
}

/**
 * Exporta o documento formatado diretamente para Microsoft Word (.docx)
 */
export async function exportToDocx(htmlContent: string, standard: Standard, filename = 'documento-normalizado.docx') {
  const temp = document.createElement('div')
  temp.innerHTML = htmlContent

  const docChildren: Paragraph[] = []

  temp.childNodes.forEach((node) => {
    const el = node as HTMLElement
    if (!el.tagName) return

    const text = el.innerText || el.textContent || ''

    if (el.tagName.toLowerCase() === 'h2') {
      docChildren.push(
        new Paragraph({
          text: text,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
        })
      )
    } else if (el.tagName.toLowerCase() === 'h3') {
      docChildren.push(
        new Paragraph({
          text: text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      )
    } else if (el.tagName.toLowerCase() === 'blockquote') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text, italic: true, size: 20 })],
          indent: { left: 1440 }, // Recuo de 4cm
          spacing: { before: 120, after: 120 },
        })
      )
    } else if (el.tagName.toLowerCase() === 'p') {
      const isCenter = el.classList.contains('paper-kicker') || el.classList.contains('author')
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text, size: 24 })],
          alignment: isCenter ? AlignmentType.CENTER : AlignmentType.JUSTIFY,
          indent: isCenter ? undefined : { firstLine: 720 }, // Recuo de parágrafo
          spacing: { line: standard === 'APA' || standard === 'MLA' ? 480 : 360, after: 120 },
        })
      )
    }
  })

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1700, bottom: 1134, left: 1700, right: 1134 }, // Margens ABNT (3cm topo/esq, 2cm dir/baixo)
          },
        },
        children: docChildren,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
