# KMITL GPA Simulator

Plan your academic journey at KMITL. Calculate your GPA, set goals, and simulate future grades to stay on track for graduation.

**Website:** [https://kmitl-gpa-simulator.pages.dev/](https://kmitl-gpa-simulator.pages.dev/)

## Features

- **GPA Calculator** - Calculate your GPA by entering courses, credits, and grades
- **Goal Planner** - Set a target GPA and see what upcomig grades you need to achieve it
- **What-If Simulator** - Simulate how future courses will affect your GPA (term or cumulative)
- **PDF Export** - Export your GPA report as a PDF

## KMITL Grading Scale

| Grade | Points | Description |
|-------|--------|-------------|
| A     | 4.0    | Excellent   |
| B+    | 3.5    | Very Good   |
| B     | 3.0    | Good        |
| C+    | 2.5    | Fairly Good |
| C     | 2.0    | Fair        |
| D+    | 1.5    | Poor        |
| D     | 1.0    | Very Poor   |
| F     | 0.0    | Fail        |

Special grades (S, T, I, U) are also supported.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Cloudflare Pages Functions
- **Hosting:** Cloudflare Pages

## Development

```bash
# Install wrangler CLI
npm install -g wrangler

# Run locally
wrangler pages dev public

# Deploy
wrangler pages deploy public
```

## Project Structure

```
├── public/              # Static files
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── functions/           # Cloudflare Pages Functions (API)
│   └── api/
│       ├── gpa-goal-planner.js
│       └── what-if-simulator.js
└── wrangler.jsonc       # Cloudflare config
```

## Author

Developed by Phyo Thi Khaing
