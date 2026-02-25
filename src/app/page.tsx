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
  categories: ["Navigation & Paths", "Files & Directories", "Viewing & Editing", "Pipes & Redirection", "Permissions"],
  values: [100, 200, 300, 400, 500],
  clues: {
    // Category 0: Navigation & Paths
    0: {
      0: { q: "This command displays the full absolute path of your current working directory.", a: "What is pwd?" },
      1: { q: "Running cd with no arguments takes you to this location.", a: "What is your home directory?" },
      2: { q: "From /home/student/projects, this command moves you up one level to /home/student.", a: "What is cd ..?" },
      3: { q: "/var/log/syslog is this type of path, because it starts from the root.", a: "What is an absolute path?" },
      4: { q: "This shortcut character represents your home directory in a path (e.g., ~/Documents).", a: "What is ~ (tilde)?" },
    },
    // Category 1: Files & Directories
    1: {
      0: { q: "This command creates a new empty directory.", a: "What is mkdir?" },
      1: { q: "This ls flag shows hidden files — the ones starting with a dot.", a: "What is -a?" },
      2: { q: "To copy a directory AND everything inside it, you need this flag with cp.", a: "What is -r (recursive)?" },
      3: { q: "Unlike cp, this command relocates a file so it no longer exists in the original location.", a: "What is mv?" },
      4: { q: "Adding this flag to rm makes it prompt you for confirmation before each deletion.", a: "What is -i (interactive)?" },
    },
    // Category 2: Viewing & Editing
    2: {
      0: { q: "This command dumps the entire contents of a file to the screen.", a: "What is cat?" },
      1: { q: "In vi, pressing this key switches from command mode to insert mode.", a: "What is i?" },
      2: { q: "This command shows the last 20 lines of access.log: tail -n 20 access.log. The command name means this body part.", a: "What is tail?" },
      3: { q: "In vi, this command sequence saves the file and exits: colon, w, q.", a: "What is :wq?" },
      4: { q: "To see the first 5 lines of /etc/passwd, you use this command with -n 5.", a: "What is head?" },
    },
    // Category 3: Pipes & Redirection
    3: {
      0: { q: "This symbol sends the output of one command as input to another command.", a: "What is the pipe |?" },
      1: { q: "The > operator does this to an existing file's contents.", a: "What is overwrite (replace) them?" },
      2: { q: "To add text to the end of a file without destroying existing content, use this double operator.", a: "What is >>?" },
      3: { q: "ls /etc | grep network — the grep part of this command does this job.", a: "What is filter the output to show only lines containing 'network'?" },
      4: { q: "This redirection operator sends error messages (stderr) to a file: the number 2 followed by >.", a: "What is 2>?" },
    },
    // Category 4: Permissions
    4: {
      0: { q: "The permission string -rwxr-x--- translates to this three-digit octal number.", a: "What is 750?" },
      1: { q: "chmod u+x script.sh adds this specific permission for the owner only.", a: "What is execute?" },
      2: { q: "chmod 644 gives the owner read/write and gives group and others this permission.", a: "What is read-only?" },
      3: { q: "This command changes the group ownership of a file (not the owner).", a: "What is chgrp?" },
      4: { q: "chown student:staff notes.txt sets both owner and group in one command. The colon separates these two things.", a: "What are the user and the group?" },
    },
  },
  finalJeopardy: {
    category: "Linux Security",
    clue: "When a file has permissions -rw-r-----, the three dashes at the end mean this group of users has absolutely no access to the file.",
    answer: "Who are 'others' (everyone else on the system)?",
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

