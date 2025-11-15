import { Question, AssessmentInfo } from "../types/assesment-type";

// Fallback questions that match the API structure
export const fallbackQuestions: Question[] = [
  // Section 1: Comprehension (5 questions)
  {
    id: 1,
    section: "Comprehension",
    question: "What is the main purpose of reading comprehension?",
    options: [
      "To read as quickly as possible",
      "To understand and interpret written text",
      "To memorize every word",
      "To find spelling errors"
    ],
    points: 1
  },
  {
    id: 2,
    section: "Comprehension",
    question: "Context clues can help determine the meaning of unfamiliar words.",
    options: ["True", "False"],
    points: 1
  },
  {
    id: 3,
    section: "Comprehension", 
    question: "What does 'inference' mean in reading comprehension?",
    options: [
      "Reading between the lines to understand implied meaning",
      "Copying text word for word",
      "Reading very slowly",
      "Skipping difficult passages"
    ],
    points: 1
  },
  {
    id: 4,
    section: "Comprehension",
    question: "The topic sentence of a paragraph is always the first sentence.",
    options: ["True", "False"],
    points: 1
  },
  {
    id: 5,
    section: "Comprehension",
    question: "Which strategy helps improve reading comprehension?",
    options: [
      "Reading without taking breaks",
      "Summarizing key points while reading",
      "Speed reading without understanding",
      "Avoiding difficult vocabulary"
    ],
    points: 1
  },

  // Section 2: Vocabulary (5 questions)
  {
    id: 6,
    section: "Vocabulary",
    question: "What does the word 'meticulous' mean?",
    options: [
      "Careless and sloppy",
      "Very careful and precise", 
      "Quick and hasty",
      "Loud and noisy"
    ],
    points: 1
  },
  {
    id: 7,
    section: "Vocabulary",
    question: "Synonyms are words that have opposite meanings.",
    options: ["True", "False"],
    points: 1
  },
  {
    id: 8,
    section: "Vocabulary",
    question: "Which word is a synonym for 'enormous'?",
    options: ["Tiny", "Huge", "Small", "Average"],
    points: 1
  },
  {
    id: 9,
    section: "Vocabulary",
    question: "A prefix comes at the beginning of a word.",
    options: ["True", "False"],
    points: 1
  },
  {
    id: 10,
    section: "Vocabulary",
    question: "What does the prefix 'un-' typically indicate?",
    options: ["More than", "Not or opposite", "Again", "Before"],
    points: 1
  },

  // Section 3: Grammar (5 questions)
  {
    id: 11,
    section: "Grammar",
    question: "Which sentence is grammatically correct?",
    options: [
      "She don't like coffee.",
      "She doesn't like coffee.",
      "She not like coffee.", 
      "She no like coffee."
    ],
    points: 1
  },
  {
    id: 12,
    section: "Grammar",
    question: "Choose the correct past tense form: 'Yesterday, I _____ to the store.'",
    options: ["go", "goes", "went", "going"],
    points: 1
  },
  {
    id: 13,
    section: "Grammar",
    question: "The word 'their' is a possessive pronoun.",
    options: ["True", "False"],
    points: 1
  },
  {
    id: 14,
    section: "Grammar",
    question: "Which sentence uses the correct subject-verb agreement?",
    options: [
      "The dogs runs in the park.",
      "The dog run in the park.",
      "The dogs run in the park.",
      "The dog are running in the park."
    ],
    points: 1
  },
  {
    id: 15,
    section: "Grammar",
    question: "An adverb typically modifies a verb, adjective, or another adverb.",
    options: ["True", "False"],
    points: 1
  },

  // Section 4: Writing (5 questions)
  {
    id: 16,
    section: "Writing",
    question: "Which is the most effective opening sentence for a formal email?",
    options: [
      "Hey there!",
      "I hope this email finds you well.",
      "What's up?",
      "Yo!"
    ],
    points: 1
  },
  {
    id: 17,
    section: "Writing",
    question: "A thesis statement should appear in the conclusion of an essay.",
    options: ["True", "False"],
    points: 1
  },
  {
    id: 18,
    section: "Writing",
    question: "Which transition word best shows contrast?",
    options: ["Furthermore", "However", "Additionally", "Similarly"],
    points: 1
  },
  {
    id: 19,
    section: "Writing",
    question: "In formal writing, contractions (like 'can't' and 'won't') should be avoided.",
    options: ["True", "False"],
    points: 1
  },
  {
    id: 20,
    section: "Writing",
    question: "Which sentence demonstrates parallel structure?",
    options: [
      "She likes reading, writing, and to paint.",
      "She likes reading, writing, and painting.",
      "She likes to read, writing, and painting.",
      "She likes reading, to write, and painting."
    ],
    points: 1
  }
];

export const fallbackAssessmentInfo: AssessmentInfo = {
  totalQuestions: 20,
  questionsPerSection: 5,
  sections: ["Comprehension", "Vocabulary", "Grammar", "Writing"],
  passingScore: 60,
  timeLimit: 15,
  assessmentType: "English Proficiency",
  instructions: "This assessment evaluates your English language skills across four key areas. You have 15 minutes to complete 20 multiple-choice questions. A score of 60% or higher qualifies you for advanced English tasks."
};

// Helper function to convert API Question to component format
export interface ComponentQuestion {
  questionId: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false";
  options?: string[];
  correctAnswer?: string;
  points: number;
  section: string;
}

export const convertApiQuestionToComponent = (question: Question): ComponentQuestion => {
  const isTrueFalse = question.options.length === 2 && 
                     question.options.includes("True") && 
                     question.options.includes("False");
  
  return {
    questionId: question.id.toString(),
    questionText: question.question,
    questionType: isTrueFalse ? "true_false" : "multiple_choice",
    options: question.options,
    points: question.points,
    section: question.section
  };
};

export const assessmentSections = [
  {
    id: 1,
    title: "Comprehension",
    description: "Reading comprehension and text analysis skills",
    questionIds: ["q1", "q2", "q3", "q4", "q5"]
  },
  {
    id: 2,
    title: "Vocabulary",
    description: "Word knowledge, definitions, and usage",
    questionIds: ["q6", "q7", "q8", "q9", "q10"]
  },
  {
    id: 3,
    title: "Grammar",
    description: "English grammar rules, sentence structure, and syntax",
    questionIds: ["q11", "q12", "q13", "q14", "q15"]
  },
  {
    id: 4,
    title: "Writing",
    description: "Writing skills, style, and composition techniques",
    questionIds: ["q16", "q17", "q18", "q19", "q20"]
  }
];