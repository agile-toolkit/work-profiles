const CURRENT_BOARD_KEY = 'kanban-designer:currentBoard'

interface KdCard {
  title: string
  description?: string
  assignee?: string
}

interface KdColumn {
  name: string
  cards: KdCard[]
}

interface KdCurrentBoard {
  boardName: string
  columns: KdColumn[]
  updatedAt: string
}

export interface KanbanDesignerCard {
  title: string
  column: string
}

// Kanban Designer's `writeCurrentBoard()` doesn't mark which column (if
// any) is the terminal/"done" one — this is a best-effort name match so a
// person's active-card count doesn't include work they've already finished.
const DONE_COLUMN_RE = /\b(done|complete(d)?|finished|closed|shipped)\b/i

export function readKanbanDesignerCards(profileName: string): KanbanDesignerCard[] {
  const name = profileName.trim()
  if (!name) return []
  try {
    const raw = localStorage.getItem(CURRENT_BOARD_KEY)
    if (!raw) return []
    const board = JSON.parse(raw) as KdCurrentBoard
    if (!Array.isArray(board.columns)) return []
    return board.columns.flatMap(col => {
      if (DONE_COLUMN_RE.test(col.name)) return []
      if (!Array.isArray(col.cards)) return []
      return col.cards
        .filter(card => (card.assignee ?? '').trim().toLowerCase() === name.toLowerCase())
        .map(card => ({ title: card.title, column: col.name }))
    })
  } catch {
    return []
  }
}
