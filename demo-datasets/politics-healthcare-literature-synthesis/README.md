# Politics of Healthcare Benchmark Dataset (Demo)

This synthetic dataset demonstrates the GradeGuard AI folder import format for historical benchmarking.

## Folder Layout

- `manifest.csv` (required)
- `assignments/` with text files referenced by `file_name` in the manifest

## Required Columns in `manifest.csv`

- `student_id`
- `student_name`
- `assignment_title`
- `course_id`
- `grade_points`
- `max_points`
- `year`
- `file_name`

Optional:
- `grade_percent`

## Demo Target

- Course: `Politics of Healthcare`
- Assignment: `Literature Synthesis`
- Rubric basis: 30-point mark scheme
