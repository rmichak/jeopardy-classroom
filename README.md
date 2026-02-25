# 🎮 Jeopardy! — Classroom Edition

A web-based Jeopardy game built for classroom use. Designed for projectors, with auto-scoring, a Final Jeopardy countdown timer, and full game save/load via JSON files.

**Live:** [jeopardy-classroom.vercel.app](https://jeopardy-classroom.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white) ![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

## Features

- **Projector-friendly** — Full-width board with large text that fills the screen
- **Auto-scoring** — Click a clue → reveal the answer → select which team buzzed in → mark correct ✅ or wrong ❌. Points are added or deducted automatically based on the clue value
- **Final Jeopardy** — Includes a configurable countdown timer (10–300 seconds) with visual pulse when time is running low. Enter each team's wager and score them individually
- **Game editor** — Configure team names, number of categories (2–8), number of rows (1–8), all questions/answers, and Final Jeopardy settings
- **Create new games** — Start from a blank slate with the ➕ New button
- **Save/Load** — Export your game as a JSON file and load it later. Game state includes scores and which clues have been used, so you can pause and resume
- **Game name** — Each game has a title (e.g., "ITN 170 — Modules 1–4") displayed in the header and used as the save file name
- **Keyboard shortcuts** — `Space` to reveal answers, `Escape` to close overlays
- **No database required** — Everything runs client-side. Just open the page and play

## How to Play

1. Open the game in a browser (or project onto a screen)
2. Students pick a category and point value
3. Click the cell to reveal the clue
4. Press **Show Answer** (or `Space`) when ready
5. Select which team buzzed in, then mark ✅ Correct or ❌ Wrong
6. If no one answers, click **No one got it — Close**
7. When the board is cleared, hit 🏆 **Final** for Final Jeopardy

## Creating Your Own Games

### Option 1: Use the Editor
1. Click **➕ New** to start a blank game
2. Enter a game name, set up teams, categories, and clues
3. Click **✅ Create Game**
4. Click **💾 Save** to download as a JSON file for later

### Option 2: Edit the JSON Directly
Save a game first to see the format, then edit the JSON file in any text editor. The structure is straightforward:

```json
{
  "game": {
    "title": "My Game",
    "teams": ["Team A", "Team B"],
    "categories": ["Category 1", "Category 2"],
    "values": [100, 200, 300, 400, 500],
    "clues": {
      "0": {
        "0": { "q": "Clue text here", "a": "What is the answer?" }
      }
    },
    "finalJeopardy": {
      "category": "Final Category",
      "clue": "Final clue text",
      "answer": "What is the answer?",
      "timerSeconds": 60
    }
  }
}
```

## Tech Stack

- [Next.js 14](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Vercel](https://vercel.com/) — Hosting & deployment
- No external dependencies beyond React — lightweight and fast

## Running Locally

```bash
git clone https://github.com/rmichak/jeopardy-classroom.git
cd jeopardy-classroom
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

MIT — use it however you want for your classes.
