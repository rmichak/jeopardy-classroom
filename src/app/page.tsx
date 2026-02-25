'use client'

import './globals.css'
import { useState, useCallback, useEffect, useRef } from 'react'

// ============================================================
// TYPES
// ============================================================
interface ClueData {
  q: string
  a: string
}

interface GameData {
  title: string
  teams: string[]
  categories: string[]
  values: number[]
  clues: Record<number, Record<number, ClueData>>
  finalJeopardy: {
    category: string
    clue: string
    answer: string
  }
}

interface SaveData {
  game: GameData
  scores: Record<string, number>
  usedClues: string[]
}

// ============================================================
// DEFAULT GAME
// ============================================================
const DEFAULT_GAME: GameData = {
  title: "Jeopardy!",
  teams: ["Team 1", "Team 2"],
  categories: ["AI", "History", "IoT", "Daily Life", "Laws"],
  values: [100, 200, 300, 400, 500],
  clues: {
    0: {
      0: { q: "This type of AI mimics human conversation.", a: "What is a chatbot?" },
      1: { q: "GPT stands for this.", a: "What is Generative Pre-trained Transformer?" },
      2: { q: "The 'T' in the Turing Test is named after this person.", a: "Who is Alan Turing?" },
      3: { q: "This technique trains AI using labeled data.", a: "What is supervised learning?" },
      4: { q: "This AI model created by OpenAI can generate images from text.", a: "What is DALL-E?" },
    },
    1: {
      0: { q: "The year the World Wide Web was invented.", a: "What is 1989?" },
      1: { q: "This company created the first personal computer.", a: "What is IBM?" },
      2: { q: "Moore's Law predicts this doubles every ~2 years.", a: "What is the number of transistors on a chip?" },
      3: { q: "ARPANET was the precursor to this.", a: "What is the Internet?" },
      4: { q: "This 1984 Apple ad introduced the Macintosh.", a: "What is the '1984' Super Bowl commercial?" },
    },
    2: {
      0: { q: "IoT stands for this.", a: "What is the Internet of Things?" },
      1: { q: "This protocol is commonly used by IoT devices for messaging.", a: "What is MQTT?" },
      2: { q: "A smart thermostat that learns your schedule.", a: "What is Nest?" },
      3: { q: "This attack turns IoT devices into a botnet.", a: "What is Mirai?" },
      4: { q: "The estimated number of IoT devices worldwide by 2025.", a: "What is ~75 billion?" },
    },
    3: {
      0: { q: "This voice assistant lives in Amazon's Echo.", a: "What is Alexa?" },
      1: { q: "This app uses AI to recommend your next binge-watch.", a: "What is Netflix?" },
      2: { q: "Face ID on iPhones uses this type of technology.", a: "What is facial recognition?" },
      3: { q: "This AI feature in Gmail suggests how to finish your sentences.", a: "What is Smart Compose?" },
      4: { q: "Self-driving cars primarily use this type of sensor to 'see'.", a: "What is LiDAR?" },
    },
    4: {
      0: { q: "This 2018 regulation protects EU citizens' data.", a: "What is GDPR?" },
      1: { q: "In the US, this act regulates children's online privacy.", a: "What is COPPA?" },
      2: { q: "This principle means collecting only necessary data.", a: "What is data minimization?" },
      3: { q: "The EU's proposed law specifically regulating AI systems.", a: "What is the EU AI Act?" },
      4: { q: "This legal concept holds creators responsible for AI harm.", a: "What is liability?" },
    },
  },
  finalJeopardy: {
    category: "The Future",
    clue: "This theoretical point where AI surpasses human intelligence is both anticipated and feared.",
    answer: "What is the Singularity?",
  },
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function JeopardyGame() {
  const [game, setGame] = useState<GameData>(() => deepClone(DEFAULT_GAME))
  const [scores, setScores] = useState<Record<string, number>>({})
  const [usedClues, setUsedClues] = useState<Set<string>>(new Set())

  // Overlay states
  const [activeClue, setActiveClue] = useState<{ catIdx: number; rowIdx: number } | null>(null)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; type: 'correct' | 'wrong' } | null>(null)

  // Final Jeopardy
  const [showFinal, setShowFinal] = useState(false)
  const [finalAnswerRevealed, setFinalAnswerRevealed] = useState(false)
  const [finalWagers, setFinalWagers] = useState<Record<string, number>>({})
  const [finalScored, setFinalScored] = useState<Set<string>>(new Set())

  // Editor
  const [showEditor, setShowEditor] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Init scores when game teams change
  useEffect(() => {
    setScores(prev => {
      const next: Record<string, number> = {}
      game.teams.forEach(t => { next[t] = prev[t] ?? 0 })
      return next
    })
  }, [game.teams])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        if (showEditor) setShowEditor(false)
        else if (showFinal) { setShowFinal(false); setFinalAnswerRevealed(false) }
        else if (activeClue) closeClue()
      }
      if (e.key === ' ') {
        if (activeClue && !answerRevealed) { e.preventDefault(); setAnswerRevealed(true) }
        else if (showFinal && !finalAnswerRevealed) { e.preventDefault(); setFinalAnswerRevealed(true) }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeClue, answerRevealed, showFinal, finalAnswerRevealed, showEditor])

  // Clean up close timer
  useEffect(() => { return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current) } }, [])

  // ---- CLUE ACTIONS ----
  const openClue = useCallback((catIdx: number, rowIdx: number) => {
    const key = `${catIdx}-${rowIdx}`
    if (usedClues.has(key)) return
    if (!game.clues[catIdx]?.[rowIdx]) { alert('No clue data. Open the editor to add one.'); return }
    setActiveClue({ catIdx, rowIdx })
    setAnswerRevealed(false)
    setSelectedTeam(null)
    setFeedback(null)
  }, [usedClues, game.clues])

  const closeClue = useCallback(() => {
    if (activeClue) {
      setUsedClues(prev => new Set(prev).add(`${activeClue.catIdx}-${activeClue.rowIdx}`))
    }
    setActiveClue(null)
    setAnswerRevealed(false)
    setSelectedTeam(null)
    setFeedback(null)
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null }
  }, [activeClue])

  const scoreCorrect = useCallback(() => {
    if (!selectedTeam || !activeClue) return
    const pts = game.values[activeClue.rowIdx]
    setScores(prev => ({ ...prev, [selectedTeam]: (prev[selectedTeam] || 0) + pts }))
    setFeedback({ text: `${selectedTeam} +$${pts}!`, type: 'correct' })
    closeTimerRef.current = setTimeout(() => closeClue(), 1200)
  }, [selectedTeam, activeClue, game.values, closeClue])

  const scoreWrong = useCallback(() => {
    if (!selectedTeam || !activeClue) return
    const pts = game.values[activeClue.rowIdx]
    setScores(prev => ({ ...prev, [selectedTeam]: (prev[selectedTeam] || 0) - pts }))
    setFeedback({ text: `${selectedTeam} -$${pts}`, type: 'wrong' })
    setSelectedTeam(null)
  }, [selectedTeam, activeClue, game.values])

  // ---- FINAL JEOPARDY ----
  const scoreFinalTeam = useCallback((team: string, correct: boolean) => {
    const wager = finalWagers[team] || 0
    setScores(prev => ({
      ...prev,
      [team]: (prev[team] || 0) + (correct ? wager : -wager),
    }))
    setFinalScored(prev => new Set(prev).add(team))
  }, [finalWagers])

  const openFinal = useCallback(() => {
    if (!game.finalJeopardy?.clue) { alert('No Final Jeopardy configured.'); return }
    setShowFinal(true)
    setFinalAnswerRevealed(false)
    setFinalWagers({})
    setFinalScored(new Set())
  }, [game.finalJeopardy])

  // ---- SAVE / LOAD ----
  const saveGame = useCallback(() => {
    const data: SaveData = { game, scores, usedClues: Array.from(usedClues) }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = (game.categories.slice(0, 3).join('-') || 'jeopardy').replace(/[^a-zA-Z0-9-]/g, '')
    a.download = `jeopardy-${safeName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [game, scores, usedClues])

  const handleFileLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data: SaveData = JSON.parse(ev.target?.result as string)
        if (data.game) {
          setGame(data.game)
          setScores(data.scores || {})
          setUsedClues(new Set(data.usedClues || []))
        } else { alert('Invalid game file format.') }
      } catch (err) { alert('Error loading file: ' + (err as Error).message) }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const resetBoard = useCallback(() => {
    if (!confirm('Reset the board? All clues will reopen and scores reset to $0.')) return
    setUsedClues(new Set())
    setScores(() => {
      const s: Record<string, number> = {}
      game.teams.forEach(t => { s[t] = 0 })
      return s
    })
  }, [game.teams])

  // ---- RENAME TEAM ----
  const renameTeam = useCallback((oldName: string) => {
    const newName = prompt(`Rename "${oldName}" to:`, oldName)
    if (!newName || newName === oldName) return
    setGame(prev => ({
      ...prev,
      teams: prev.teams.map(t => t === oldName ? newName : t),
    }))
    setScores(prev => {
      const next = { ...prev }
      next[newName] = next[oldName] || 0
      delete next[oldName]
      return next
    })
  }, [])

  // ---- GET CURRENT CLUE DATA ----
  const clueData = activeClue ? game.clues[activeClue.catIdx]?.[activeClue.rowIdx] : null
  const clueValue = activeClue ? game.values[activeClue.rowIdx] : 0

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <h1>Jeopardy!</h1>
        <div className="header-controls">
          <button className="btn btn-final" onClick={openFinal}>🏆 Final</button>
          <button className="btn btn-primary" onClick={() => setShowEditor(true)}>✏️ Edit</button>
          <button className="btn btn-success" onClick={saveGame}>💾 Save</button>
          <button className="btn btn-warning" onClick={() => fileInputRef.current?.click()}>📂 Load</button>
          <button className="btn btn-danger" onClick={resetBoard}>🔄 Reset</button>
        </div>
      </div>

      {/* SCOREBOARD */}
      <div className="scoreboard">
        {game.teams.map(team => (
          <div key={team} className={`team-score ${selectedTeam === team ? 'active-team' : ''}`}>
            <span className="team-name" onClick={() => renameTeam(team)}>{team}</span>
            <span className="score-value">${scores[team] || 0}</span>
          </div>
        ))}
      </div>

      {/* BOARD */}
      <div className="board-container">
        <div className="board" style={{ gridTemplateColumns: `repeat(${game.categories.length}, 1fr)` }}>
          {game.categories.map((cat, i) => (
            <div key={`cat-${i}`} className="category-cell">{cat}</div>
          ))}
          {game.values.map((val, rowIdx) =>
            game.categories.map((_, catIdx) => {
              const key = `${catIdx}-${rowIdx}`
              const used = usedClues.has(key)
              return (
                <div
                  key={key}
                  className={`clue-cell ${used ? 'used' : ''}`}
                  onClick={() => !used && openClue(catIdx, rowIdx)}
                >
                  {used ? '' : `$${val}`}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* CLUE OVERLAY */}
      {activeClue && clueData && (
        <div className="overlay active" onClick={e => { if ((e.target as HTMLElement).classList.contains('overlay')) closeClue() }}>
          <div className="clue-card">
            <button className="clue-close" onClick={closeClue}>&times;</button>
            <div className="clue-category">{game.categories[activeClue.catIdx]}</div>
            <div className="clue-value">${clueValue}</div>
            <div className="clue-text">{clueData.q}</div>

            {answerRevealed && (
              <div className="clue-answer visible">
                <div className="clue-answer-label">Answer</div>
                <div className="clue-answer-text">{clueData.a}</div>
              </div>
            )}

            {!answerRevealed && (
              <div className="clue-controls">
                <button className="btn btn-primary btn-lg" onClick={() => setAnswerRevealed(true)}>Show Answer</button>
              </div>
            )}

            {answerRevealed && (
              <div className="scoring-panel visible">
                <div className="scoring-prompt">Who buzzed in?</div>
                <div className="scoring-teams">
                  {game.teams.map(team => (
                    <button
                      key={team}
                      className={`scoring-team-btn ${selectedTeam === team ? 'selected' : ''}`}
                      onClick={() => { setSelectedTeam(team); setFeedback(null) }}
                    >
                      {team}
                    </button>
                  ))}
                </div>
                {selectedTeam && (
                  <div className="scoring-result visible">
                    <button className="btn btn-correct" onClick={scoreCorrect}>✅ Correct</button>
                    <button className="btn btn-wrong" onClick={scoreWrong}>❌ Wrong</button>
                  </div>
                )}
                {feedback && (
                  <div className={`score-feedback visible ${feedback.type}`}>{feedback.text}</div>
                )}
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-skip" onClick={closeClue}>No one got it — Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINAL JEOPARDY OVERLAY */}
      {showFinal && game.finalJeopardy && (
        <div className="overlay active">
          <div className="clue-card final-card">
            <button className="clue-close" onClick={() => { setShowFinal(false); setFinalAnswerRevealed(false) }}>&times;</button>
            <div className="clue-category">{game.finalJeopardy.category}</div>
            <div className="clue-value">⭐ FINAL JEOPARDY ⭐</div>
            <div className="clue-text">{game.finalJeopardy.clue}</div>

            {finalAnswerRevealed && (
              <div className="clue-answer visible">
                <div className="clue-answer-label">Answer</div>
                <div className="clue-answer-text">{game.finalJeopardy.answer}</div>
              </div>
            )}

            {!finalAnswerRevealed && (
              <div className="clue-controls">
                <button className="btn btn-final btn-lg" onClick={() => setFinalAnswerRevealed(true)}>Show Answer</button>
              </div>
            )}

            {finalAnswerRevealed && (
              <div className="scoring-panel visible">
                <div className="scoring-prompt">Award points to teams that got it right:</div>
                <div className="scoring-teams" style={{ flexDirection: 'column', alignItems: 'center' }}>
                  {game.teams.map(team => (
                    <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ color: '#ce93d8', fontSize: '1.2rem', fontWeight: 700, minWidth: 120, textAlign: 'right' }}>{team}:</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Wager"
                        disabled={finalScored.has(team)}
                        value={finalWagers[team] || ''}
                        onChange={e => setFinalWagers(prev => ({ ...prev, [team]: parseInt(e.target.value) || 0 }))}
                        style={{
                          padding: '8px 12px', border: `1px solid ${finalScored.has(team) ? '#69f0ae' : '#ce93d8'}`,
                          borderRadius: 6, background: '#1a0830', color: '#fff', width: 100, textAlign: 'center', fontSize: '1.1rem',
                        }}
                      />
                      <button className="btn btn-correct" style={{ padding: '10px 20px' }} disabled={finalScored.has(team)} onClick={() => scoreFinalTeam(team, true)}>✅</button>
                      <button className="btn btn-wrong" style={{ padding: '10px 20px' }} disabled={finalScored.has(team)} onClick={() => scoreFinalTeam(team, false)}>❌</button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-skip" onClick={() => { setShowFinal(false); setFinalAnswerRevealed(false) }}>Done — Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDITOR */}
      {showEditor && <GameEditor game={game} onApply={(g) => { setGame(g); setUsedClues(new Set()); setShowEditor(false) }} onClose={() => setShowEditor(false)} />}

      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileLoad} />
    </>
  )
}

// ============================================================
// EDITOR COMPONENT
// ============================================================
function GameEditor({ game, onApply, onClose }: { game: GameData; onApply: (g: GameData) => void; onClose: () => void }) {
  const [teams, setTeams] = useState(game.teams)
  const [catCount, setCatCount] = useState(game.categories.length)
  const [rowCount, setRowCount] = useState(game.values.length)
  const [categories, setCategories] = useState(game.categories)
  const [clues, setClues] = useState(game.clues)
  const [fj, setFj] = useState(game.finalJeopardy)

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
    onApply({
      ...game,
      teams,
      categories: categories.slice(0, catCount),
      values,
      clues,
      finalJeopardy: fj,
    })
  }

  return (
    <div className="modal-overlay active">
      <div className="modal">
        <h2>✏️ Game Editor</h2>

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

        <div className="category-block final-block">
          <h4>🏆 Final Jeopardy</h4>
          <div className="form-row"><label>Category:</label><input value={fj.category} onChange={e => setFj(prev => ({ ...prev, category: e.target.value }))} /></div>
          <div className="form-row"><label>Clue:</label><textarea value={fj.clue} onChange={e => setFj(prev => ({ ...prev, clue: e.target.value }))} /></div>
          <div className="form-row"><label>Answer:</label><input value={fj.answer} onChange={e => setFj(prev => ({ ...prev, answer: e.target.value }))} /></div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleApply}>✅ Apply</button>
        </div>
      </div>
    </div>
  )
}

