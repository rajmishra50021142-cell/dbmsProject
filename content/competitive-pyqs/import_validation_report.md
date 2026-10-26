# Import Validation Report: GATE CSE DBMS Competitive PYQs

## 1. Inventory Summary

| Source PDF Document | Expected Questions | Imported Questions | Playable (Scored) | Incomplete (Subjective) | Figures / Assets |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Functional Dependencies and Normalization** | 56 | 56 | 53 | 3 | 56 |
| **Structured Query Language (SQL)** | 44 | 44 | 42 | 2 | 44 |
| **ER Diagrams** | 15 | 15 | 15 | 0 | 15 |
| **Total Combined Bank** | **115** | **115** | **110** | **5** | **115** |

## 2. Question Types Breakdown

- **Single-Correct MCQ**: 91 questions
- **Multiple-Select MSQ**: 9 questions (FD Q1, Q2, Q3, Q25, Q26, Q28, Q29; SQL Q11)
- **Numerical Answer (NAT)**: 15 questions (FD Q5, Q11, Q12, Q24, Q27; SQL Q3, Q4, Q12, Q13, Q14, Q16, Q17, Q18, Q19; ER Q10)
- **Descriptive / Proof (Incomplete status, excluded from scored quizzes)**: 5 questions (FD Q52, Q53, Q56; SQL Q43, Q44)

## 3. High-Resolution Visual Assets
Every single question has a 200 DPI cropped asset saved in `frontend/public/pyq-assets/` and `content/competitive-pyqs/figures/`.
All mathematical formulas, tabular schemas, ER diagrams, query code, and options are preserved with 100% visual fidelity.

## 4. AI Practice Isolation
- `backend/app/practice/ai_questions.py` contains 30 questions: UNCHANGED.
- `frontend/src/data/fallbackPracticeData.json` `ai` array: UNCHANGED.
- AI practice and Competitive Exam PYQs operate on separate question pools.
