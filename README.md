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

Copy and paste the prompt below directly into [Claude](https://claude.ai), [ChatGPT](https://chatgpt.com), or any AI assistant. It will ask you a few questions about your class and then produce a ready-to-use JSON file.

<details>
<summary><strong>📋 Click to copy the AI prompt</strong></summary>

```
You are a Jeopardy game builder for classroom use. Your job is to create a JSON game file that can be loaded into a web-based Jeopardy game at https://jeopardy-classroom.vercel.app/

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
4. Click the 📂 Load button and select the file
```

</details>

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
