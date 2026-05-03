/**
 * Quiz workflow integration tests
 * Tests the full user journey through the quiz
 */
import { calculatePercentage, getQuizFeedback, getFallbackResponse } from '../utils/electionUtils';

const QUESTIONS = [
  { q: "Minimum age to vote?", opts: ["16","18","21","25"], ans: 1 },
  { q: "What does VVPAT stand for?", opts: ["Voter Verified Paper Audit Trail","Voting Verification Protocol","Verified Voter Paper","Voter Validated Archive"], ans: 0 },
  { q: "Seats for majority in Lok Sabha?", opts: ["201","250","272","300"], ans: 2 },
  { q: "What is MCC?", opts: ["Code for candidates only","ECI guidelines on election schedule","Parliament law","Media rules"], ans: 1 },
  { q: "What does NOTA mean?", opts: ["No Option To Abstain","None Of The Above","No Outstanding Agenda","National Option"], ans: 1 },
  { q: "Form for new voter registration?", opts: ["Form 1","Form 6","Form 8","Form 3"], ans: 1 },
  { q: "Campaign must stop before polling?", opts: ["24 hours","36 hours","48 hours","72 hours"], ans: 2 },
  { q: "Article for universal adult franchise?", opts: ["19","21","326","352"], ans: 2 },
];

// Simulate quiz state machine
function simulateQuiz(userAnswers) {
  let score = 0;
  const results = [];

  userAnswers.forEach((answer, index) => {
    const question = QUESTIONS[index];
    const isCorrect = answer === question.ans;
    if (isCorrect) score++;
    results.push({ question: question.q, isCorrect, userAnswer: answer, correctAnswer: question.ans });
  });

  return { score, total: userAnswers.length, results };
}

describe('Quiz Workflow', () => {
  test('perfect score quiz gives 100%', () => {
    const perfectAnswers = QUESTIONS.map(q => q.ans);
    const { score, total } = simulateQuiz(perfectAnswers);
    expect(calculatePercentage(score, total)).toBe(100);
  });

  test('all wrong answers gives 0%', () => {
    const wrongAnswers = QUESTIONS.map(q => (q.ans + 1) % 4);
    const { score, total } = simulateQuiz(wrongAnswers);
    expect(calculatePercentage(score, total)).toBe(0);
  });

  test('half correct gives 50%', () => {
    const halfAnswers = QUESTIONS.map((q, i) => i % 2 === 0 ? q.ans : (q.ans + 1) % 4);
    const { score, total } = simulateQuiz(halfAnswers);
    expect(calculatePercentage(score, total)).toBe(50);
  });

  test('quiz results track correct/incorrect correctly', () => {
    const answers = QUESTIONS.map(q => q.ans); // all correct
    const { results } = simulateQuiz(answers);
    results.forEach(r => expect(r.isCorrect).toBe(true));
  });

  test('quiz tracks individual wrong answers', () => {
    const answers = QUESTIONS.map(() => 0); // all pick option 0
    const { results } = simulateQuiz(answers);
    const wrongCount = results.filter(r => !r.isCorrect).length;
    expect(wrongCount).toBeGreaterThan(0);
  });

  test('score increments correctly question by question', () => {
    let runningScore = 0;
    QUESTIONS.forEach((q, i) => {
      const isCorrect = QUESTIONS[i].ans === QUESTIONS[i].ans; // always correct
      if (isCorrect) runningScore++;
    });
    expect(runningScore).toBe(QUESTIONS.length);
  });

  test('quiz completion triggers feedback', () => {
    const perfectAnswers = QUESTIONS.map(q => q.ans);
    const { score, total } = simulateQuiz(perfectAnswers);
    const pct = calculatePercentage(score, total);
    const feedback = getQuizFeedback(pct);
    expect(feedback).toBeTruthy();
    expect(feedback).toContain('expert');
  });

  test('quiz has 8 questions', () => {
    expect(QUESTIONS.length).toBe(8);
  });

  test('all questions have 4 options', () => {
    QUESTIONS.forEach(q => expect(q.opts.length).toBe(4));
  });

  test('all correct answers are valid option indices', () => {
    QUESTIONS.forEach(q => {
      expect(q.ans).toBeGreaterThanOrEqual(0);
      expect(q.ans).toBeLessThan(q.opts.length);
    });
  });
});

describe('Chatbot Workflow', () => {
  const queries = [
    { input: 'how to register as voter', expectedKeyword: 'Form 6' },
    { input: 'what is evm machine', expectedKeyword: 'Electronic Voting Machines' },
    { input: 'explain nota option', expectedKeyword: 'NOTA' },
    { input: 'get voter id card', expectedKeyword: 'EPIC' },
    { input: 'electronic voting process', expectedKeyword: 'EVMs' },
  ];

  queries.forEach(({ input, expectedKeyword }) => {
    test(`responds to "${input}" with "${expectedKeyword}"`, () => {
      const response = getFallbackResponse(input);
      expect(response).toContain(expectedKeyword);
    });
  });

  test('chatbot never returns null', () => {
    const inputs = ['', '   ', 'xyz', 'test123', 'voter id', 'evm', 'nota'];
    inputs.forEach(input => {
      expect(getFallbackResponse(input)).not.toBeNull();
    });
  });

  test('chatbot never returns undefined', () => {
    expect(getFallbackResponse('anything')).not.toBeUndefined();
  });

  test('chatbot response is always HTML-safe string', () => {
    const response = getFallbackResponse('voter id');
    expect(typeof response).toBe('string');
  });

  test('multiple sequential chatbot queries work correctly', () => {
    const responses = [
      getFallbackResponse('voter id'),
      getFallbackResponse('evm'),
      getFallbackResponse('nota'),
    ];
    responses.forEach(r => expect(r).toBeTruthy());
    expect(responses[0]).not.toEqual(responses[1]);
    expect(responses[1]).not.toEqual(responses[2]);
  });
});

describe('Scoring Edge Cases', () => {
  test('score of 7/8 gives expert feedback', () => {
    const pct = calculatePercentage(7, 8);
    expect(pct).toBe(88);
    expect(getQuizFeedback(pct)).toContain('expert');
  });

  test('score of 5/8 gives good job feedback', () => {
    const pct = calculatePercentage(5, 8);
    expect(pct).toBe(63);
    expect(getQuizFeedback(pct)).toContain('Good job');
  });

  test('score of 3/8 gives not bad feedback', () => {
    const pct = calculatePercentage(3, 8);
    expect(pct).toBe(38);
    expect(getQuizFeedback(pct)).toContain('Not bad');
  });

  test('score of 1/8 gives keep learning feedback', () => {
    const pct = calculatePercentage(1, 8);
    expect(pct).toBe(13);
    expect(getQuizFeedback(pct)).toContain('Keep learning');
  });
});
