export type Standard = 'ABNT' | 'APA' | 'IEEE' | 'Vancouver' | 'MLA'

export interface Section {
  id: string
  title: string
  order: number
}

export interface FeedbackItem {
  id: string
  type: 'success' | 'warning' | 'tip'
  title: string
  message: string
  actionLabel?: string
  fixAction?: () => void
}

export interface AnalysisResult {
  wordCount: number
  charCount: number
  paragraphCount: number
  complianceScore: number
  totalRules: number
  feedbacks: FeedbackItem[]
  misspelledWords: string[]
}
