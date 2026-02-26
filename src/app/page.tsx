'use client'

import './globals.css'
import { useState, useCallback, useEffect, useRef } from 'react'
import GameEditor from './editor'

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
    timerSeconds?: number
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
  title: "Intro to Python",
  teams: ["Team 1", "Team 2"],
  categories: ["Variables & Types", "Strings", "Lists & Loops", "Functions", "Conditionals"],
  values: [100, 200, 300, 400, 500],
  clues: {
    // Category 0: Variables & Types
    0: {
      0: { q: "In Python, you create a variable by using this operator to assign a value: x = 10.", a: "What is the = (assignment) operator?" },
      1: { q: "The built-in function type() returns this when you pass it the number 3.14.", a: "What is float?" },
      2: { q: "Python lets you assign multiple variables in one line like this: a, b, c = 1, 2, 3. This is called this technique.", a: "What is multiple assignment (or tuple unpacking)?" },
      3: { q: "Unlike languages like Java, Python does not require you to declare this before using a variable.", a: "What is a data type?" },
      4: { q: "The int() function does this to the string '42'.", a: "What is convert (cast) it to the integer 42?" },
    },
    // Category 1: Strings
    1: {
      0: { q: "You can create a string in Python using either single quotes or these.", a: "What are double quotes?" },
      1: { q: "This string method converts 'hello' to 'HELLO'.", a: "What is .upper()?" },
      2: { q: "Placing an f before a string literal lets you embed variables directly inside curly braces.", a: "What is an f-string (formatted string literal)?" },
      3: { q: "The expression 'Python'[0:3] returns this value.", a: "What is 'Pyt'?" },
      4: { q: "This string method splits 'one,two,three' into a list of three items using a comma.", a: "What is .split(',')?" },
    },
    // Category 2: Lists & Loops
    2: {
      0: { q: "In Python, a list is created using these bracket characters.", a: "What are square brackets [ ]?" },
      1: { q: "This method adds a single item to the end of a list.", a: "What is .append()?" },
      2: { q: "A for loop that prints each item in a list starts with: for item in this.", a: "What is the list name?" },
      3: { q: "The range(5) function generates numbers from 0 up to but not including this number.", a: "What is 5?" },
      4: { q: "This one-line syntax creates a new list by applying an expression to each item: [x*2 for x in numbers].", a: "What is a list comprehension?" },
    },
    // Category 3: Functions
    3: {
      0: { q: "In Python, you define a function using this keyword followed by the function name.", a: "What is def?" },
      1: { q: "A function sends a value back to the caller using this keyword.", a: "What is return?" },
      2: { q: "A function defined with def greet(name='World') has this kind of parameter.", a: "What is a default parameter?" },
      3: { q: "The special value a Python function returns if it has no return statement.", a: "What is None?" },
      4: { q: "A small anonymous function written in one line using this keyword: square = lambda x: x ** 2.", a: "What is lambda?" },
    },
    // Category 4: Conditionals
    4: {
      0: { q: "This keyword starts a conditional statement in Python.", a: "What is if?" },
      1: { q: "When an if condition is False, you check another condition using this keyword.", a: "What is elif?" },
      2: { q: "Python uses True and False — these are the two values of this data type.", a: "What is bool (boolean)?" },
      3: { q: "The operator == checks for equality, while this operator checks if two values are NOT equal.", a: "What is != ?" },
      4: { q: "This logical operator returns True only when BOTH conditions are True: if age >= 18 and has_id.", a: "What is and?" },
    },
  },
  finalJeopardy: {
    category: "Python History",
    clue: "Python was created by this Dutch programmer, who named the language after Monty Python's Flying Circus.",
    answer: "Who is Guido van Rossum?",
    timerSeconds: 60,
  },
}

const BLANK_GAME: GameData = {
  title: "",
  teams: ["Team 1", "Team 2"],
  categories: ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
  values: [100, 200, 300, 400, 500],
  clues: {},
  finalJeopardy: { category: "", clue: "", answer: "", timerSeconds: 60 },
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ============================================================
// COUNTDOWN TIMER HOOK
// ============================================================
function useCountdown(initialSeconds: number, autoStart: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            setRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds > 0])

  const start = () => setRunning(true)
  const pause = () => setRunning(false)
  const reset = (s: number) => { setSeconds(s); setRunning(false) }

  return { seconds, running, start, pause, reset }
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function JeopardyGame() {
  const [game, setGame] = useState<GameData>(() => deepClone(DEFAULT_GAME))
  const [scores, setScores] = useState<Record<string, number>>({})
  const [usedClues, setUsedClues] = useState<Set<string>>(new Set())

  const [activeClue, setActiveClue] = useState<{ catIdx: number; rowIdx: number } | null>(null)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ text: string; type: 'correct' | 'wrong' } | null>(null)

  const [showFinal, setShowFinal] = useState(false)
  const [finalAnswerRevealed, setFinalAnswerRevealed] = useState(false)
  const [finalWagers, setFinalWagers] = useState<Record<string, number>>({})
  const [finalScored, setFinalScored] = useState<Set<string>>(new Set())
  const [finalTimerStarted, setFinalTimerStarted] = useState(false)

  const [showEditor, setShowEditor] = useState(false)
  const [editorMode, setEditorMode] = useState<'edit' | 'new'>('edit')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const finalTimer = useCountdown(game.finalJeopardy?.timerSeconds || 60, false)

  useEffect(() => {
    setScores(prev => {
      const next: Record<string, number> = {}
      game.teams.forEach(t => { next[t] = prev[t] ?? 0 })
      return next
    })
  }, [game.teams])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'Escape') {
        if (showEditor) setShowEditor(false)
        else if (showFinal) { setShowFinal(false); setFinalAnswerRevealed(false); setFinalTimerStarted(false) }
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
    setScores(prev => ({ ...prev, [team]: (prev[team] || 0) + (correct ? wager : -wager) }))
    setFinalScored(prev => new Set(prev).add(team))
  }, [finalWagers])

  const openFinal = useCallback(() => {
    if (!game.finalJeopardy?.clue) { alert('No Final Jeopardy configured.'); return }
    setShowFinal(true)
    setFinalAnswerRevealed(false)
    setFinalWagers({})
    setFinalScored(new Set())
    setFinalTimerStarted(false)
    finalTimer.reset(game.finalJeopardy.timerSeconds || 60)
  }, [game.finalJeopardy])

  const startFinalTimer = useCallback(() => {
    setFinalTimerStarted(true)
    finalTimer.start()
  }, [finalTimer])

  // ---- NEW GAME ----
  const createNewGame = useCallback(() => {
    setEditorMode('new')
    setShowEditor(true)
  }, [])

  const editGame = useCallback(() => {
    setEditorMode('edit')
    setShowEditor(true)
  }, [])

  // ---- SAVE / LOAD ----
  const saveGame = useCallback(() => {
    const data: SaveData = { game, scores, usedClues: Array.from(usedClues) }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = (game.title || game.categories.slice(0, 3).join('-') || 'jeopardy').replace(/[^a-zA-Z0-9- ]/g, '').replace(/\s+/g, '-')
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
          if (!data.game.finalJeopardy.timerSeconds) data.game.finalJeopardy.timerSeconds = 60
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
    setScores(() => { const s: Record<string, number> = {}; game.teams.forEach(t => { s[t] = 0 }); return s })
  }, [game.teams])

  const renameTeam = useCallback((oldName: string) => {
    const newName = prompt(`Rename "${oldName}" to:`, oldName)
    if (!newName || newName === oldName) return
    setGame(prev => ({ ...prev, teams: prev.teams.map(t => t === oldName ? newName : t) }))
    setScores(prev => { const next = { ...prev }; next[newName] = next[oldName] || 0; delete next[oldName]; return next })
  }, [])

  const clueData = activeClue ? game.clues[activeClue.catIdx]?.[activeClue.rowIdx] : null
  const clueValue = activeClue ? game.values[activeClue.rowIdx] : 0

  // Timer display helper
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1>{game.title || 'Jeopardy!'}</h1>
          <a href="https://github.com/rmichak/jeopardy-classroom" target="_blank" rel="noopener noreferrer"
            style={{ color: '#90caf9', fontSize: '0.85rem', textDecoration: 'none', opacity: 0.7 }}
            onMouseOver={e => (e.currentTarget.style.opacity = '1')}
            onMouseOut={e => (e.currentTarget.style.opacity = '0.7')}>GitHub ↗</a>
        </div>
        <div className="header-controls">
          <button className="btn" style={{ background: '#00695c', color: '#fff' }} onClick={createNewGame}>➕ New</button>
          <button className="btn btn-primary" onClick={editGame}>✏️ Edit</button>
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

      {/* FINAL JEOPARDY BUTTON + AI LINK */}
      <div className="board-top-bar">
        <button className="btn btn-final btn-final-board" onClick={openFinal}>🏆 FINAL JEOPARDY</button>
        <a href="/instructions" target="_blank" rel="noopener noreferrer" className="ai-help-link">🤖 Create games with AI</a>
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
                <div key={key} className={`clue-cell ${used ? 'used' : ''}`} onClick={() => !used && openClue(catIdx, rowIdx)}>
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
                    <button key={team} className={`scoring-team-btn ${selectedTeam === team ? 'selected' : ''}`}
                      onClick={() => { setSelectedTeam(team); setFeedback(null) }}>{team}</button>
                  ))}
                </div>
                {selectedTeam && (
                  <div className="scoring-result visible">
                    <button className="btn btn-correct" onClick={scoreCorrect}>✅ Correct</button>
                    <button className="btn btn-wrong" onClick={scoreWrong}>❌ Wrong</button>
                  </div>
                )}
                {feedback && <div className={`score-feedback visible ${feedback.type}`}>{feedback.text}</div>}
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-skip" onClick={closeClue}>No one got it — Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINAL JEOPARDY */}
      {showFinal && game.finalJeopardy && (
        <div className="overlay active">
          <div className="clue-card final-card">
            <button className="clue-close" onClick={() => { setShowFinal(false); setFinalAnswerRevealed(false); setFinalTimerStarted(false) }}>&times;</button>
            <div className="clue-category">{game.finalJeopardy.category}</div>
            <div className="clue-value">⭐ FINAL JEOPARDY ⭐</div>
            <div className="clue-text">{game.finalJeopardy.clue}</div>

            {/* TIMER */}
            {!finalAnswerRevealed && (
              <div style={{ marginTop: 30 }}>
                <div className={`final-timer ${finalTimer.seconds <= 10 && finalTimerStarted ? 'final-timer-critical' : ''} ${finalTimer.seconds === 0 ? 'final-timer-done' : ''}`}>
                  {formatTime(finalTimer.seconds)}
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {!finalTimerStarted && (
                    <button className="btn btn-final btn-lg" onClick={startFinalTimer}>▶️ Start Timer</button>
                  )}
                  {finalTimerStarted && finalTimer.running && (
                    <button className="btn btn-warning" onClick={() => finalTimer.pause()}>⏸ Pause</button>
                  )}
                  {finalTimerStarted && !finalTimer.running && finalTimer.seconds > 0 && (
                    <button className="btn btn-final" onClick={() => finalTimer.start()}>▶️ Resume</button>
                  )}
                  <button className="btn btn-primary btn-lg" onClick={() => setFinalAnswerRevealed(true)}>Show Answer</button>
                </div>
              </div>
            )}

            {finalAnswerRevealed && (
              <>
                <div className="clue-answer visible">
                  <div className="clue-answer-label">Answer</div>
                  <div className="clue-answer-text">{game.finalJeopardy.answer}</div>
                </div>
                <div className="scoring-panel visible">
                  <div className="scoring-prompt">Award points to teams that got it right:</div>
                  <div className="scoring-teams" style={{ flexDirection: 'column', alignItems: 'center' }}>
                    {game.teams.map(team => (
                      <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ color: '#ce93d8', fontSize: '1.2rem', fontWeight: 700, minWidth: 120, textAlign: 'right' }}>{team}:</span>
                        <input type="number" min={0} placeholder="Wager" disabled={finalScored.has(team)}
                          value={finalWagers[team] || ''}
                          onChange={e => setFinalWagers(prev => ({ ...prev, [team]: parseInt(e.target.value) || 0 }))}
                          style={{ padding: '8px 12px', border: `1px solid ${finalScored.has(team) ? '#69f0ae' : '#ce93d8'}`, borderRadius: 6, background: '#1a0830', color: '#fff', width: 100, textAlign: 'center', fontSize: '1.1rem' }}
                        />
                        <button className="btn btn-correct" style={{ padding: '10px 20px' }} disabled={finalScored.has(team)} onClick={() => scoreFinalTeam(team, true)}>✅</button>
                        <button className="btn btn-wrong" style={{ padding: '10px 20px' }} disabled={finalScored.has(team)} onClick={() => scoreFinalTeam(team, false)}>❌</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button className="btn btn-skip" onClick={() => { setShowFinal(false); setFinalAnswerRevealed(false); setFinalTimerStarted(false) }}>Done — Close</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* EDITOR */}
      {showEditor && (
        <GameEditor
          game={editorMode === 'new' ? deepClone(BLANK_GAME) : game}
          isNew={editorMode === 'new'}
          onApply={(g) => { setGame(g); setUsedClues(new Set()); setScores(() => { const s: Record<string, number> = {}; g.teams.forEach(t => { s[t] = 0 }); return s }); setShowEditor(false) }}
          onClose={() => setShowEditor(false)}
        />
      )}

      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileLoad} />
    </>
  )
}
