import { getFallbackResponse, calculatePercentage, getQuizFeedback } from '../utils/electionUtils';

describe('Election Utilities', () => {

  // ── getFallbackResponse ─────────────────────────────────────────────────
  describe('getFallbackResponse', () => {
    test('returns registration info for "voter id" query', () => {
      const res = getFallbackResponse('how to get voter id');
      expect(res).toContain('Voter Registration');
      expect(res).toContain('Form 6');
    });

    test('returns registration info for "register" keyword', () => {
      const res = getFallbackResponse('how do I register to vote');
      expect(res).toContain('Form 6');
    });

    test('returns EPIC card info for "epic" keyword', () => {
      const res = getFallbackResponse('What is EPIC card');
      expect(res).toContain('EPIC');
    });

    test('returns EVM info for "evm" query', () => {
      const res = getFallbackResponse('how does evm work');
      expect(res).toContain('Electronic Voting Machines');
    });

    test('returns EVM info for "electronic voting" keyword', () => {
      const res = getFallbackResponse('tell me about electronic voting');
      expect(res).toContain('EVMs');
    });

    test('returns NOTA info for "nota" query', () => {
      const res = getFallbackResponse('what is nota');
      expect(res).toContain('NOTA');
      expect(res).toContain('None Of The Above');
    });

    test('returns generic response for unrecognised query', () => {
      const res = getFallbackResponse('random unrelated question xyz');
      expect(res).toContain('🇮🇳');
    });

    test('is case-insensitive', () => {
      const res = getFallbackResponse('HOW DOES EVM WORK');
      expect(res).toContain('Electronic Voting Machines');
    });

    test('always returns a non-empty string', () => {
      expect(getFallbackResponse('')).toBeTruthy();
      expect(getFallbackResponse('   ')).toBeTruthy();
    });
  });

  // ── calculatePercentage ─────────────────────────────────────────────────
  describe('calculatePercentage', () => {
    test('calculates 80% for 8/10', () => {
      expect(calculatePercentage(8, 10)).toBe(80);
    });

    test('rounds correctly for 1/3', () => {
      expect(calculatePercentage(1, 3)).toBe(33);
    });

    test('returns 0 for score of 0', () => {
      expect(calculatePercentage(0, 5)).toBe(0);
    });

    test('returns 0 when total is 0 (avoids divide-by-zero)', () => {
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    test('returns 100 for perfect score', () => {
      expect(calculatePercentage(10, 10)).toBe(100);
    });

    test('handles fractional result rounded to nearest integer', () => {
      expect(calculatePercentage(2, 3)).toBe(67);
    });
  });

  // ── getQuizFeedback ─────────────────────────────────────────────────────
  describe('getQuizFeedback', () => {
    test('returns expert message for 90%', () => {
      expect(getQuizFeedback(90)).toContain('expert');
    });

    test('returns expert message for exactly 85%', () => {
      expect(getQuizFeedback(85)).toContain('expert');
    });

    test('returns "Good job" message for 70%', () => {
      expect(getQuizFeedback(70)).toContain('Good job');
    });

    test('returns "Not bad" message for 50%', () => {
      expect(getQuizFeedback(50)).toContain('Not bad');
    });

    test('returns "Keep learning" message for low score (20%)', () => {
      expect(getQuizFeedback(20)).toContain('Keep learning');
    });

    test('returns a message for 0%', () => {
      expect(typeof getQuizFeedback(0)).toBe('string');
      expect(getQuizFeedback(0).length).toBeGreaterThan(0);
    });

    test('returns a message for 100%', () => {
      expect(typeof getQuizFeedback(100)).toBe('string');
      expect(getQuizFeedback(100)).toContain('expert');
    });
  });

});
