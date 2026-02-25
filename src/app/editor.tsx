'use client'

import { useState } from 'react'

interface ClueData { q: string; a: string }
interface GameData {
  title: string
  teams: string[]
  categories: string[]
  values: number[]
  clues: Record<number, Record<number, ClueData>>
  finalJeopardy: { category: string; clue: string; answer: string; timerSeconds?: number }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export default function GameEditor({ game, isNew, onApply, onClose }: {
  game: GameData; isNew: boolean; onApply: (g: GameData) => void; onClose: () => void
}) {
  const [title, setTitle] = useState(game.title)
  const [teams, setTeams] = useState(game.teams)
  const [catCount, setCatCount] = useState(game.categories.length)
  const [rowCount, setRowCount] = useState(game.values.length)
  const [categories, setCategories] = useState(game.categories)
  const [clues, setClues] = useState(game.clues)
  const [fj, setFj] = useState(game.finalJeopardy)
  const [timerSec, setTimerSec] = useState(game.finalJeopardy.timerSeconds || 60)

  const values = Array.from({ length: rowCount }, (_, i) => (i + 1) * 100)

  const updateClue = (c: number, r: number, field: 'q' | 'a', val: string) => {
    setClues(prev => {
      const next = deepClone(prev)
      if (!next[c]) next[c] = {}
      if (!next[c][r]) next[c][r] = { q: '', a: '' }
      next[c][r][field] = val
      return next
    })
  }

  const handleApply = () => {
    if (isNew && !title.trim()) {
      alert('Please enter a game name.')
      return
    }
    onApply({
      ...game,
      title: title.trim() || game.title,
      teams,
      categories: categories.slice(0, catCount),
      values,
      clues,
      finalJeopardy: { ...fj, timerSeconds: timerSec },
    })
  }

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <h2>{isNew ? '➕ Create New Game' : '✏️ Edit Game'}</h2>

        {/* GAME NAME */}
        <div className="form-row" style={{ marginBottom: 20 }}>
          <label style={{ minWidth: 90, fontWeight: 700, fontSize: '1rem' }}>Game Name:</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., ITN 170 — Modules 1–4"
            style={{ fontSize: '1.1rem', padding: '10px 14px' }} />
        </div>

        {/* TEAMS */}
        <div className="team-config">
          <label>Teams:</label>
          <input type="number" min={1} max={8} value={teams.length}
            onChange={e => {
              const n = Math.max(1, Math.min(8, parseInt(e.target.value) || 2))
              setTeams(prev => {
                const next = [...prev]
                while (next.length < n) next.push(`Team ${next.length + 1}`)
                return next.slice(0, n)
              })
            }}
            style={{ padding: '6px 10px', border: '1px solid #1a237e', borderRadius: 6, background: '#0a0e2a', color: '#fff', width: 50, textAlign: 'center' }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 10 }}>
            {teams.map((t, i) => (
              <input key={i} value={t}
                onChange={e => setTeams(prev => prev.map((old, j) => j === i ? e.target.value : old))}
                style={{ padding: '6px 10px', border: '1px solid #1a237e', borderRadius: 6, background: '#0a0e2a', color: '#fff', width: 120 }}
              />
            ))}
          </div>
        </div>

        {/* GRID SIZE */}
        <div className="team-config">
          <label>Categories:</label>
          <input type="number" min={2} max={8} value={catCount}
            onChange={e => {
              const n = Math.max(2, Math.min(8, parseInt(e.target.value) || 5))
              setCatCount(n)
              setCategories(prev => {
                const next = [...prev]
                while (next.length < n) next.push(`Category ${next.length + 1}`)
                return next
              })
            }}
            style={{ padding: '6px 10px', border: '1px solid #1a237e', borderRadius: 6, background: '#0a0e2a', color: '#fff', width: 50, textAlign: 'center' }}
          />
          <label style={{ marginLeft: 16 }}>Rows:</label>
          <input type="number" min={1} max={8} value={rowCount}
            onChange={e => setRowCount(Math.max(1, Math.min(8, parseInt(e.target.value) || 5)))}
            style={{ padding: '6px 10px', border: '1px solid #1a237e', borderRadius: 6, background: '#0a0e2a', color: '#fff', width: 50, textAlign: 'center' }}
          />
        </div>

        {/* CATEGORIES & CLUES */}
        {Array.from({ length: catCount }).map((_, c) => (
          <div key={c} className="category-block">
            <h4>Category {c + 1}</h4>
            <div className="form-row">
              <label>Name:</label>
              <input value={categories[c] || ''} onChange={e => setCategories(prev => prev.map((old, j) => j === c ? e.target.value : old))} placeholder="Category name" />
            </div>
            {values.map((val, r) => {
              const cd = clues[c]?.[r]
              return (
                <div key={r}>
                  <div className="form-row" style={{ marginTop: 8 }}>
                    <label>${val} Q:</label>
                    <textarea value={cd?.q || ''} onChange={e => updateClue(c, r, 'q', e.target.value)} placeholder="Question / Clue" />
                  </div>
                  <div className="form-row">
                    <label>${val} A:</label>
                    <input value={cd?.a || ''} onChange={e => updateClue(c, r, 'a', e.target.value)} placeholder="Answer" />
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* FINAL JEOPARDY */}
        <div className="category-block final-block">
          <h4>🏆 Final Jeopardy</h4>
          <div className="form-row"><label>Category:</label><input value={fj.category} onChange={e => setFj(prev => ({ ...prev, category: e.target.value }))} placeholder="Final Jeopardy category" /></div>
          <div className="form-row"><label>Clue:</label><textarea value={fj.clue} onChange={e => setFj(prev => ({ ...prev, clue: e.target.value }))} placeholder="Final Jeopardy clue" /></div>
          <div className="form-row"><label>Answer:</label><input value={fj.answer} onChange={e => setFj(prev => ({ ...prev, answer: e.target.value }))} placeholder="Final Jeopardy answer" /></div>
          <div className="form-row">
            <label>Timer:</label>
            <input type="number" min={10} max={300} value={timerSec}
              onChange={e => setTimerSec(Math.max(10, Math.min(300, parseInt(e.target.value) || 60)))}
              style={{ width: 80, textAlign: 'center' }}
            />
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>seconds (10–300)</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleApply}>{isNew ? '✅ Create Game' : '✅ Apply'}</button>
        </div>
      </div>
    </div>
  )
}
