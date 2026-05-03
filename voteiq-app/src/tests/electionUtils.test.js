import { getFallbackResponse, calculatePercentage, getQuizFeedback } from '../utils/electionUtils';

describe('getFallbackResponse', () => {
  // Registration keywords
  test('returns registration info for "voter id"', () => {
    const res = getFallbackResponse('how to get voter id');
    expect(res).toContain('Voter Registration');
    expect(res).toContain('Form 6');
  });
  test('returns registration info for "register"', () => {
    expect(getFallbackResponse('how do I register')).toContain('Form 6');
  });
  test('returns registration info for "epic"', () => {
    expect(getFallbackResponse('what is epic card')).toContain('EPIC');
  });
  test('is case-insensitive for registration', () => {
    expect(getFallbackResponse('VOTER ID HELP')).toContain('Form 6');
  });

  // EVM keywords
  test('returns EVM info for "evm"', () => {
    const res = getFallbackResponse('how does evm work');
    expect(res).toContain('Electronic Voting Machines');
  });
  test('returns EVM info for "electronic voting"', () => {
    expect(getFallbackResponse('tell me about electronic voting')).toContain('EVMs');
  });
  test('EVM response mentions VVPAT', () => {
    expect(getFallbackResponse('evm')).toContain('VVPAT');
  });

  // NOTA keywords
  test('returns NOTA info for "nota"', () => {
    const res = getFallbackResponse('what is nota');
    expect(res).toContain('NOTA');
    expect(res).toContain('None Of The Above');
  });
  test('NOTA response explains winner rule', () => {
    expect(getFallbackResponse('nota rules')).toContain('next highest candidate');
  });

  // Generic fallback
  test('returns generic response for unknown query', () => {
    expect(getFallbackResponse('random question xyz')).toContain('🇮🇳');
  });
  test('returns generic response for empty string', () => {
    expect(getFallbackResponse('')).toBeTruthy();
  });
  test('always returns a non-empty string', () => {
    expect(getFallbackResponse('   ').length).toBeGreaterThan(0);
  });
  test('returns string type always', () => {
    expect(typeof getFallbackResponse('anything')).toBe('string');
  });
});

describe('calculatePercentage', () => {
  test('calculates 80% for 8 out of 10', () => {
    expect(calculatePercentage(8, 10)).toBe(80);
  });
  test('rounds 1/3 to 33', () => {
    expect(calculatePercentage(1, 3)).toBe(33);
  });
  test('returns 0 when score is 0', () => {
    expect(calculatePercentage(0, 5)).toBe(0);
  });
  test('returns 0 when total is 0 (no divide by zero)', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
  });
  test('returns 100 for perfect score', () => {
    expect(calculatePercentage(10, 10)).toBe(100);
  });
  test('rounds 2/3 to 67', () => {
    expect(calculatePercentage(2, 3)).toBe(67);
  });
  test('calculates 50% correctly', () => {
    expect(calculatePercentage(4, 8)).toBe(50);
  });
  test('calculates 25% correctly', () => {
    expect(calculatePercentage(2, 8)).toBe(25);
  });
  test('handles large numbers', () => {
    expect(calculatePercentage(500, 1000)).toBe(50);
  });
});

describe('getQuizFeedback', () => {
  test('returns expert message for 90%', () => {
    expect(getQuizFeedback(90)).toContain('expert');
  });
  test('returns expert message for exactly 85%', () => {
    expect(getQuizFeedback(85)).toContain('expert');
  });
  test('returns expert message for 100%', () => {
    expect(getQuizFeedback(100)).toContain('expert');
  });
  test('returns good job message for 70%', () => {
    expect(getQuizFeedback(70)).toContain('Good job');
  });
  test('returns good job message for exactly 60%', () => {
    expect(getQuizFeedback(60)).toContain('Good job');
  });
  test('returns not bad message for 50%', () => {
    expect(getQuizFeedback(50)).toContain('Not bad');
  });
  test('returns not bad message for exactly 35%', () => {
    expect(getQuizFeedback(35)).toContain('Not bad');
  });
  test('returns keep learning for 20%', () => {
    expect(getQuizFeedback(20)).toContain('Keep learning');
  });
  test('returns keep learning for 0%', () => {
    expect(getQuizFeedback(0)).toContain('Keep learning');
  });
  test('always returns a non-empty string', () => {
    expect(getQuizFeedback(50).length).toBeGreaterThan(0);
  });
  test('returns string type always', () => {
    expect(typeof getQuizFeedback(75)).toBe('string');
  });
});

describe('Integration: quiz scoring flow', () => {
  test('perfect quiz score gives expert feedback', () => {
    const score = 8;
    const total = 8;
    const pct = calculatePercentage(score, total);
    expect(pct).toBe(100);
    expect(getQuizFeedback(pct)).toContain('expert');
  });

  test('half score gives not bad feedback', () => {
    const pct = calculatePercentage(4, 8);
    expect(pct).toBe(50);
    expect(getQuizFeedback(pct)).toContain('Not bad');
  });

  test('zero score gives keep learning feedback', () => {
    const pct = calculatePercentage(0, 8);
    expect(pct).toBe(0);
    expect(getQuizFeedback(pct)).toContain('Keep learning');
  });

  test('chatbot responds correctly for voter registration query', () => {
    const response = getFallbackResponse('I want to register as a voter');
    expect(response).toContain('Form 6');
    expect(response).toContain('18+');
  });

  test('chatbot responds to EVM query with VVPAT info', () => {
    const response = getFallbackResponse('explain evm to me');
    expect(response).toContain('Electronic Voting Machines');
    expect(response).toContain('VVPAT');
  });

  test('chatbot handles NOTA query end-to-end', () => {
    const response = getFallbackResponse('what happens with nota votes');
    expect(response).toContain('NOTA');
    expect(response).toContain('None Of The Above');
  });

  test('score boundary: 84% gives good job not expert', () => {
    const feedback = getQuizFeedback(84);
    expect(feedback).toContain('Good job');
    expect(feedback).not.toContain('expert');
  });

  test('score boundary: 59% gives not bad not good job', () => {
    const feedback = getQuizFeedback(59);
    expect(feedback).toContain('Not bad');
    expect(feedback).not.toContain('Good job');
  });

  test('score boundary: 34% gives keep learning not not bad', () => {
    const feedback = getQuizFeedback(34);
    expect(feedback).toContain('Keep learning');
    expect(feedback).not.toContain('Not bad');
  });

  test('calculatePercentage output feeds correctly into getQuizFeedback', () => {
    [
      { score: 8, total: 8, expected: 'expert' },
      { score: 6, total: 8, expected: 'Good job' },
      { score: 4, total: 8, expected: 'Not bad' },
      { score: 1, total: 8, expected: 'Keep learning' },
    ].forEach(({ score, total, expected }) => {
      const pct = calculatePercentage(score, total);
      expect(getQuizFeedback(pct)).toContain(expected);
    });
  });
});
