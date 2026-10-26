import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
// @ts-ignore
import html2pdf from 'html2pdf.js'
import { Standard } from '../types/document'

export function exportToTxt(textContent: string, filename = 'documento-normalizado.txt') {
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, filename)
}

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
 * Exporta para PDF diretamente sem abrir caixa de impressão
 */
export function exportToPdf(element: HTMLElement, filename = 'documento-normalizado.pdf') {
  const opt = {
    margin: [15, 15, 15, 15],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  html2pdf().set(opt).from(element).save()
}

/**
 * Exporta para DOCX mantendo estilos fiéis da norma
 */
export async function exportToDocx(htmlContent: string, standard: Standard, filename = 'documento-normalizado.docx') {
  const temp = document.createElement('div')
  temp.innerHTML = htmlContent

  const docChildren: Paragraph[] = []

  temp.childNodes.forEach((node) => {
    const el = node as HTMLElement
    if (!el.tagName) return
    const text = (el.innerText || el.textContent || '').trim()
    if (!text) return

    const tag = el.tagName.toLowerCase()

    if (tag === 'h2') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text, bold: true, size: 28, font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 360, after: 180 },
        })
      )
    } else if (tag === 'h3') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text, bold: true, size: 24, font: 'Arial' })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      )
    } else if (tag === 'blockquote') {
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text, size: 20, font: 'Arial' })],
          indent: { left: 2268 }, // 4 cm
          spacing: { before: 120, after: 120, line: 240 },
        })
      )
    } else if (tag === 'p') {
      const isCenter = el.classList.contains('paper-kicker') || el.classList.contains('author')
      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text, size: 24, font: 'Arial' })],
          alignment: isCenter ? AlignmentType.CENTER : AlignmentType.JUSTIFY,
          indent: isCenter ? undefined : { firstLine: 720 }, // Recuo de 1,25cm
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
            margin: { top: 1700, bottom: 1134, left: 1700, right: 1134 },
          },
        },
        children: docChildren,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
