import { describe, it, expect, beforeEach } from 'vitest'
import { readKanbanDesignerCards } from './kanbanDesignerImport'

const KEY = 'kanban-designer:currentBoard'

function setBoard(board: unknown) {
  localStorage.setItem(KEY, JSON.stringify(board))
}

describe('readKanbanDesignerCards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns an empty array when there is no stored board', () => {
    expect(readKanbanDesignerCards('Alice')).toEqual([])
  })

  it('returns an empty array for a blank name', () => {
    setBoard({ boardName: 'Sprint 1', columns: [], updatedAt: '2026-01-01' })
    expect(readKanbanDesignerCards('  ')).toEqual([])
  })

  it('returns an empty array when the stored value is invalid JSON', () => {
    localStorage.setItem(KEY, '{not json')
    expect(readKanbanDesignerCards('Alice')).toEqual([])
  })

  it('matches cards assigned to the given name, case-insensitively', () => {
    setBoard({
      boardName: 'Sprint 1',
      columns: [
        { name: 'To Do', cards: [{ title: 'Fix bug', assignee: 'alice' }, { title: 'Write docs', assignee: 'Bob' }] },
        { name: 'In Progress', cards: [{ title: 'Ship feature', assignee: 'Alice' }] },
      ],
      updatedAt: '2026-01-01',
    })
    const result = readKanbanDesignerCards('Alice')
    expect(result).toEqual([
      { title: 'Fix bug', column: 'To Do' },
      { title: 'Ship feature', column: 'In Progress' },
    ])
  })

  it('excludes cards in a column that looks like a terminal/done column', () => {
    setBoard({
      boardName: 'Sprint 1',
      columns: [
        { name: 'To Do', cards: [{ title: 'Fix bug', assignee: 'Alice' }] },
        { name: 'Done', cards: [{ title: 'Old task', assignee: 'Alice' }] },
      ],
      updatedAt: '2026-01-01',
    })
    expect(readKanbanDesignerCards('Alice')).toEqual([{ title: 'Fix bug', column: 'To Do' }])
  })

  it('recognizes other terminal column name variants', () => {
    for (const columnName of ['Completed', 'Finished', 'Closed', 'Shipped']) {
      setBoard({
        boardName: 'Sprint 1',
        columns: [{ name: columnName, cards: [{ title: 'Old task', assignee: 'Alice' }] }],
        updatedAt: '2026-01-01',
      })
      expect(readKanbanDesignerCards('Alice')).toEqual([])
    }
  })

  it('does not exclude a column whose name merely contains "done" as a substring of another word', () => {
    setBoard({
      boardName: 'Sprint 1',
      columns: [{ name: 'Abandoned', cards: [{ title: 'Task', assignee: 'Alice' }] }],
      updatedAt: '2026-01-01',
    })
    expect(readKanbanDesignerCards('Alice')).toEqual([{ title: 'Task', column: 'Abandoned' }])
  })

  it('ignores cards with no assignee or a different assignee', () => {
    setBoard({
      boardName: 'Sprint 1',
      columns: [{ name: 'To Do', cards: [{ title: 'Task A' }, { title: 'Task B', assignee: 'Carol' }] }],
      updatedAt: '2026-01-01',
    })
    expect(readKanbanDesignerCards('Alice')).toEqual([])
  })

  it('counts all cards when no column can be identified as terminal', () => {
    setBoard({
      boardName: 'Sprint 1',
      columns: [
        { name: 'Backlog', cards: [{ title: 'A', assignee: 'Alice' }] },
        { name: 'In Progress', cards: [{ title: 'B', assignee: 'Alice' }] },
      ],
      updatedAt: '2026-01-01',
    })
    expect(readKanbanDesignerCards('Alice')).toHaveLength(2)
  })
})
