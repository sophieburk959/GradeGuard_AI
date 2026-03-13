# GradeGuard AI

GradeGuard AI is a demo-ready **AI-assisted grading MVP** for coursework moderation.

It helps instructors:
- submit assignments,
- define mark schemes with flexible point totals,
- generate rubric-based grading support,
- compare outcomes against historical patterns,
- and flag potential inconsistencies for manual review.

This is a **decision-support MVP**, not an autonomous grading system.

## Core Capabilities

- Dashboard with admin-style summary cards and recent submission feed
- Submission workflow with metadata + essay text capture
- Mark scheme builder with dynamic totals (e.g., out of 30)
- Grading results with:
  - criterion-by-criterion points,
  - overall points + percentage,
  - benchmark expectation from historical similar papers
- Bias checker with:
  - CSV import
  - folder import (`manifest.csv` + past papers)
  - historical consistency scoring
- Professor comparative fairness workflow:
  - enter professor-awarded points
  - auto-convert to percentage
  - flag when professor score deviates > ±10 from benchmark expectation
- Submission deletion for clean re-upload / re-grade demos

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Local mock data/state (no database required for demo)

## Project Structure

- `app/` routes and API handlers
- `components/` reusable UI and page components
- `context/` app state and local persistence
- `lib/` grading logic, bias logic, benchmark parser/utilities
- `demo-datasets/` synthetic historical datasets for demonstrations

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open:

- `http://localhost:3000`

If port 3000 is busy:

```bash
npm run dev -- -p 3001
```

Then open `http://localhost:3001`.

## Routes

- `/` Dashboard
- `/submit` Submit Work
- `/mark-schemes` Mark Schemes
- `/results` Grading Results
- `/bias-checker` Bias Checker

## Historical Folder Import Format

Bias Checker supports importing a folder with:

- `manifest.csv`
- assignment files referenced by `file_name`

Required `manifest.csv` columns:

- `student_id`
- `student_name`
- `assignment_title`
- `course_id`
- `grade_points`
- `max_points`
- `year`
- `file_name`

Optional column:

- `grade_percent`

## Included Synthetic Demo Datasets

1. Literature Synthesis (Politics of Healthcare)
- `demo-datasets/politics-healthcare-literature-synthesis/`

2. Stakeholder Analysis (Politics of Healthcare)
- `demo-datasets/politics-healthcare-stakeholder-analysis/`

## Demo Flow (Recommended)

1. Go to `/bias-checker`.
2. Upload one of the dataset folders above using **Upload Past Papers Folder**.
3. Go to `/submit` and submit a new assignment.
4. Go to `/results` and run grading.
5. Enter professor-awarded points to trigger comparative fairness checks (±10 benchmark range).

## Notes and Limitations

- MVP uses mock/heuristic logic for demonstration.
- Designed for human-in-the-loop moderation.
- Final grading decisions remain with instructors.
- Text extraction works best for text-like files (`.txt`, `.md`) in folder imports.
