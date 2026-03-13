import { HistoricalAverage, MarkScheme, Submission } from "@/lib/types";

export const initialMarkSchemes: MarkScheme[] = [
  {
    id: "scheme-1",
    schemeName: "ML Coursework Rubric",
    course: "Machine Learning",
    updatedAt: "2026-03-01T10:00:00.000Z",
    criteria: [
      {
        id: "c1",
        title: "Problem Framing",
        description: "Defines the research question and scope clearly.",
        weight: 20
      },
      {
        id: "c2",
        title: "Methodology",
        description: "Appropriate model selection, assumptions, and justification.",
        weight: 30
      },
      {
        id: "c3",
        title: "Evaluation",
        description: "Quality of experiments, metrics, and interpretation.",
        weight: 30
      },
      {
        id: "c4",
        title: "Communication",
        description: "Clarity, structure, and professional writing.",
        weight: 20
      }
    ]
  },
  {
    id: "scheme-2",
    schemeName: "Data Ethics Assessment",
    course: "Responsible AI",
    updatedAt: "2026-02-24T10:00:00.000Z",
    criteria: [
      {
        id: "c21",
        title: "Ethical Risk Identification",
        description: "Identifies key ethical and societal risks.",
        weight: 10
      },
      {
        id: "c22",
        title: "Mitigation Plan",
        description: "Proposes realistic and measurable safeguards.",
        weight: 10
      },
      {
        id: "c23",
        title: "Evidence Quality",
        description: "Uses evidence and references to support claims.",
        weight: 10
      }
    ]
  },
  {
    id: "scheme-3",
    schemeName: "Literature Synthesis Rubric",
    course: "Politics of Healthcare",
    updatedAt: "2026-03-12T10:00:00.000Z",
    criteria: [
      {
        id: "ph1",
        title: "Argument Structure",
        description: "Builds a coherent thesis and synthesis across sources.",
        weight: 10
      },
      {
        id: "ph2",
        title: "Evidence Use",
        description: "Integrates scholarly evidence with clear relevance.",
        weight: 10
      },
      {
        id: "ph3",
        title: "Critical Insight",
        description: "Shows nuanced analysis of political and healthcare trade-offs.",
        weight: 10
      }
    ]
  }
];

export const initialSubmissions: Submission[] = [
  {
    id: "sub-1001",
    studentName: "Lina Patel",
    studentId: "ML1021",
    course: "Machine Learning",
    assignmentTitle: "Predictive Maintenance Report",
    additionalNotes: "Includes ablation study appendix.",
    contentText:
      "This report frames predictive maintenance as a classification problem, compares gradient boosting and recurrent models, and evaluates precision, recall, and cost impact under class imbalance.",
    fileName: "lina_patel_report.txt",
    submittedAt: "2026-03-08T09:20:00.000Z",
    status: "graded",
    score: 84,
    flaggedForReview: true,
    reviewReason: "Outside expected ±10 historical range.",
    gradingResult: {
      overallScore: 84,
      overallPercentage: 84,
      maxScore: 100,
      confidence: 87,
      recommendation: "AI-assisted grading suggests standard moderation.",
      summaryFeedback:
        "Strong evaluation design and clear communication. Methodology explanation could include more assumptions.",
      criterionResults: [
        {
          criterionId: "c1",
          title: "Problem Framing",
          weight: 20,
          score: 17,
          feedback: "Problem and objective are clearly defined."
        },
        {
          criterionId: "c2",
          title: "Methodology",
          weight: 30,
          score: 24,
          feedback: "Method choice is suitable but model constraints need clearer discussion."
        },
        {
          criterionId: "c3",
          title: "Evaluation",
          weight: 30,
          score: 26,
          feedback: "Metrics and validation are strong with useful error analysis."
        },
        {
          criterionId: "c4",
          title: "Communication",
          weight: 20,
          score: 17,
          feedback: "Well structured and professional tone."
        }
      ]
    },
    biasResult: {
      isFlagged: true,
      consistencyScore: 61,
      expectedMin: 61,
      expectedMax: 81,
      deviation: 13,
      explanation:
        "This result is 13 points above the historical average and outside the allowed ±10 range (61-81), so it is flagged for manual review."
    }
  },
  {
    id: "sub-1002",
    studentName: "Noah Green",
    studentId: "RA3110",
    course: "Responsible AI",
    assignmentTitle: "Facial Recognition Ethics Brief",
    additionalNotes: "Submitted with citation annex.",
    fileName: "noah_green_ethics_brief.pdf",
    submittedAt: "2026-03-10T14:05:00.000Z",
    status: "pending"
  },
  {
    id: "sub-1003",
    studentName: "Maya Roberts",
    studentId: "ML1103",
    course: "Machine Learning",
    assignmentTitle: "Time Series Forecasting Portfolio",
    additionalNotes: "Contains code notebook and written reflection.",
    fileName: "maya_roberts_portfolio.zip",
    submittedAt: "2026-03-11T11:30:00.000Z",
    status: "pending"
  },
  {
    id: "sub-1004",
    studentName: "Sophie Burk",
    studentId: "PH9001",
    course: "Politics of Healthcare",
    assignmentTitle: "Literature Synthesis",
    additionalNotes: "Draft for synthesis-focused policy discussion.",
    contentText:
      "The literature synthesis evaluates market and state governance models in health systems, comparing equity outcomes, wait-time policies, and provider incentives across OECD case studies.",
    fileName: "literature_synthesis_draft.txt",
    submittedAt: "2026-03-12T09:15:00.000Z",
    status: "pending"
  }
];

export const initialHistoricalAverages: HistoricalAverage[] = [
  { year: 2022, averageScore: 69, sampleSize: 118 },
  { year: 2023, averageScore: 71, sampleSize: 124 },
  { year: 2024, averageScore: 73, sampleSize: 131 },
  { year: 2025, averageScore: 72, sampleSize: 127 }
];
