'use client'

import '../globals.css'
import { useState } from 'react'

const AI_PROMPT = `You are a Jeopardy game builder for classroom use. Your job is to create a JSON game file that can be loaded into a web-based Jeopardy game at https://jeopardy-classroom.vercel.app/

Before generating the game, ask me the following questions ONE AT A TIME. Wait for my answer before asking the next question:

1. What subject/course is this for? (e.g., "ITN 170 — Linux Administration")
2. What specific topics or chapters should the questions cover? (You can paste lecture notes, syllabus excerpts, or just describe the topics.)
3. How many categories do you want? (Default is 5, range is 2–8)
4. How many point levels per category? (Default is 5 at $100–$500, range is 1–8)
5. How many teams will play? (Default is 2) What should they be called?
6. How hard should the questions be? (e.g., "intro level — these are freshmen" or "senior level — they should know the material well")
7. Any topics or question types to avoid?
8. Do you want a Final Jeopardy question? If yes, what topic? (Default: yes, you pick the topic)
9. How many seconds for the Final Jeopardy timer? (Default: 60)

After I answer all the questions, generate the complete JSON file following these rules:

- All clues must be STATEMENTS (not questions). Example: "This command displays your current working directory." NOT "What command displays your current working directory?"
- All answers must be in Jeopardy format: "What is...?", "Who is...?", etc.
- $100 clues = easy recall, $200–$300 = moderate, $400–$500 = harder / application-based
- No trick questions — this is for learning, not gotchas
- Make sure every answer is factually correct
- Categories should be distinct and cover different aspects of the topic

Output ONLY the JSON (no explanation) in this exact format:

{
  "game": {
    "title": "Game Name Here",
    "teams": ["Team 1", "Team 2"],
    "categories": ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"],
    "values": [100, 200, 300, 400, 500],
    "clues": {
      "0": {
        "0": { "q": "Clue for Cat 1, $100", "a": "What is answer?" },
        "1": { "q": "Clue for Cat 1, $200", "a": "What is answer?" },
        "2": { "q": "Clue for Cat 1, $300", "a": "What is answer?" },
        "3": { "q": "Clue for Cat 1, $400", "a": "What is answer?" },
        "4": { "q": "Clue for Cat 1, $500", "a": "What is answer?" }
      },
      "1": {
        "0": { "q": "Clue for Cat 2, $100", "a": "What is answer?" },
        "1": { "q": "Clue for Cat 2, $200", "a": "What is answer?" },
        "2": { "q": "Clue for Cat 2, $300", "a": "What is answer?" },
        "3": { "q": "Clue for Cat 2, $400", "a": "What is answer?" },
        "4": { "q": "Clue for Cat 2, $500", "a": "What is answer?" }
      }
    },
    "finalJeopardy": {
      "category": "Final Category",
      "clue": "Final Jeopardy clue as a statement",
      "answer": "What is the answer?",
      "timerSeconds": 60
    }
  },
  "scores": {},
  "usedClues": []
}

The "clues" object must have one key per category ("0", "1", "2", etc.) and each category must have one key per point level ("0" for $100, "1" for $200, etc.). Fill in ALL categories and ALL point levels — do not use "..." or placeholders.

After outputting the JSON, remind me to:
1. Copy the JSON
2. Paste it into a text file and save it as something.json
3. Go to https://jeopardy-classroom.vercel.app/
4. Click the 📂 Load button and select the file`

export default function InstructionsPage() {
  const [copied, setCopied] = useState(false)

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = AI_PROMPT
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e2a', color: '#e2e8f0', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

        {/* Back link */}
        <a href="/" style={{ color: '#90caf9', textDecoration: 'none', fontSize: '0.95rem', display: 'inline-block', marginBottom: 24 }}>
          ← Back to Game
        </a>

        <h1 style={{ color: '#ffd740', fontSize: '2rem', marginBottom: 8 }}>🤖 Create Games with AI</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: 32 }}>
          Use Claude, ChatGPT, or any AI assistant to generate a complete Jeopardy game in seconds.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>

          <div style={{ background: '#0d1340', borderRadius: 12, padding: 24, borderLeft: '4px solid #1565c0' }}>
            <h2 style={{ color: '#ffd740', fontSize: '1.2rem', marginBottom: 8 }}>Step 1: Copy the Prompt</h2>
            <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
              Click the button below to copy a specially crafted prompt to your clipboard. This prompt tells the AI exactly how to build a Jeopardy game file for you.
            </p>
            <button onClick={copyPrompt} style={{
              padding: '14px 32px', border: 'none', borderRadius: 8,
              background: copied ? '#2e7d32' : '#1565c0', color: '#fff',
              fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', letterSpacing: 1,
            }}>
              {copied ? '✅ Copied to Clipboard!' : '📋 Copy AI Prompt'}
            </button>
          </div>

          <div style={{ background: '#0d1340', borderRadius: 12, padding: 24, borderLeft: '4px solid #6a1b9a' }}>
            <h2 style={{ color: '#ffd740', fontSize: '1.2rem', marginBottom: 8 }}>Step 2: Paste into an AI Assistant</h2>
            <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
              Open one of these AI tools and paste the prompt:
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" style={{
                padding: '10px 24px', borderRadius: 8, background: '#d97706', color: '#fff',
                textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
              }}>Claude ↗</a>
              <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" style={{
                padding: '10px 24px', borderRadius: 8, background: '#10a37f', color: '#fff',
                textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
              }}>ChatGPT ↗</a>
              <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" style={{
                padding: '10px 24px', borderRadius: 8, background: '#4285f4', color: '#fff',
                textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
              }}>Gemini ↗</a>
            </div>
            <p style={{ marginTop: 16, lineHeight: 1.6 }}>
              The AI will ask you questions about your course, topics, difficulty level, and preferences — answer them one at a time. When it has everything it needs, it will generate the JSON file.
            </p>
          </div>

          <div style={{ background: '#0d1340', borderRadius: 12, padding: 24, borderLeft: '4px solid #2e7d32' }}>
            <h2 style={{ color: '#ffd740', fontSize: '1.2rem', marginBottom: 8 }}>Step 3: Save the JSON File</h2>
            <p style={{ lineHeight: 1.6 }}>
              Once the AI outputs the JSON:
            </p>
            <ol style={{ paddingLeft: 24, lineHeight: 2, marginTop: 8 }}>
              <li>Copy the entire JSON block</li>
              <li>Open a text editor (Notepad, TextEdit, VS Code, etc.)</li>
              <li>Paste the JSON and save the file as <code style={{ background: '#1a237e', padding: '2px 8px', borderRadius: 4, color: '#ffd740' }}>my-game.json</code></li>
            </ol>
          </div>

          <div style={{ background: '#0d1340', borderRadius: 12, padding: 24, borderLeft: '4px solid #e65100' }}>
            <h2 style={{ color: '#ffd740', fontSize: '1.2rem', marginBottom: 8 }}>Step 4: Load into the Game</h2>
            <ol style={{ paddingLeft: 24, lineHeight: 2 }}>
              <li>Go to <a href="/" style={{ color: '#90caf9' }}>the Jeopardy game</a></li>
              <li>Click the <strong style={{ color: '#e65100' }}>📂 Load</strong> button in the top toolbar</li>
              <li>Select your <code style={{ background: '#1a237e', padding: '2px 8px', borderRadius: 4, color: '#ffd740' }}>.json</code> file</li>
              <li>Your game is ready to play!</li>
            </ol>
          </div>

        </div>

        {/* Tips */}
        <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, border: '1px solid #1a237e' }}>
          <h2 style={{ color: '#ffd740', fontSize: '1.2rem', marginBottom: 12 }}>💡 Tips for Better Games</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li><strong style={{ color: '#90caf9' }}>Be specific about topics.</strong> "Chapter 5 file permissions including chmod, chown, and octal notation" works better than just "Linux."</li>
            <li><strong style={{ color: '#90caf9' }}>Paste your notes.</strong> You can paste syllabus sections, lecture notes, or textbook outlines — the AI will use them to create accurate questions.</li>
            <li><strong style={{ color: '#90caf9' }}>Mention your audience.</strong> "These are community college freshmen" produces very different questions than "senior CS majors."</li>
            <li><strong style={{ color: '#90caf9' }}>Review before class.</strong> AI-generated questions are usually accurate, but always skim through the JSON to catch anything off.</li>
            <li><strong style={{ color: '#90caf9' }}>Save your games.</strong> Build a library of JSON files for different chapters — reuse them every semester.</li>
          </ul>
        </div>

        <p style={{ textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: '0.85rem' }}>
          <a href="/" style={{ color: '#90caf9', textDecoration: 'none' }}>← Back to Game</a>
          {' · '}
          <a href="https://github.com/rmichak/jeopardy-classroom" target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9', textDecoration: 'none' }}>GitHub</a>
        </p>

      </div>
    </div>
  )
}
