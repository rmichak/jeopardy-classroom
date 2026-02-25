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

### Option 3: Use AI to Generate a Game

You can use ChatGPT, Claude, or any AI assistant to generate a complete game JSON file. Just give it a prompt like this:

> Create a Jeopardy game JSON file for my \[subject\] class covering \[topics\]. Use this exact format:
>
> - 5 categories with 5 clues each ($100–$500, easy to hard)
> - All clues should be statements and all answers should be in "What is...?" format
> - Include a Final Jeopardy with a 60-second timer
> - Use this JSON structure:
>
> ```json
> {
>   "game": {
>     "title": "Game Name Here",
>     "teams": ["Team 1", "Team 2"],
>     "categories": ["Cat 1", "Cat 2", "Cat 3", "Cat 4", "Cat 5"],
>     "values": [100, 200, 300, 400, 500],
>     "clues": {
>       "0": {
>         "0": { "q": "Clue text", "a": "What is answer?" },
>         "1": { "q": "Clue text", "a": "What is answer?" },
>         "2": { "q": "Clue text", "a": "What is answer?" },
>         "3": { "q": "Clue text", "a": "What is answer?" },
>         "4": { "q": "Clue text", "a": "What is answer?" }
>       },
>       "1": { ... },
>       "2": { ... },
>       "3": { ... },
>       "4": { ... }
>     },
>     "finalJeopardy": {
>       "category": "Category Name",
>       "clue": "Final clue text",
>       "answer": "What is the answer?",
>       "timerSeconds": 60
>     }
>   },
>   "scores": {},
>   "usedClues": []
> }
> ```

**Tips for better results:**
- Be specific about the topic: "Chapter 5 of our Linux textbook covering file permissions" works better than just "Linux"
- Mention difficulty scaling: "$100 should be basic recall, $500 should require applying concepts"
- Ask for a specific number of categories if you want fewer or more than 5
- Tell it to avoid trick questions if this is for students
- You can paste your syllabus, lecture notes, or textbook chapter summaries for more accurate content

Once the AI generates the JSON, save it as a `.json` file and load it into the game with the **📂 Load** button.

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
