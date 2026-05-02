import { getFallbackResponse, calculatePercentage, getQuizFeedback } from '../utils/electionUtils';

describe('Election Utilities', () => {
  
  test('getFallbackResponse should return registration info for "voter id" query', () => {
    const response = getFallbackResponse('how to get voter id');
    expect(response).toContain('Voter Registration');
    expect(response).toContain('Form 6');
  });

  test('getFallbackResponse should return EVM info for "evm" query', () => {
    const response = getFallbackResponse('how does evm work');
    expect(response).toContain('Electronic Voting Machines');
  });

  test('calculatePercentage should correctly calculate percentage', () => {
    expect(calculatePercentage(8, 10)).toBe(80);
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(0, 5)).toBe(0);
  });

  test('getQuizFeedback should return expert message for high scores', () => {
    expect(getQuizFeedback(90)).toContain('expert');
    expect(getQuizFeedback(20)).toContain('Keep learning');
  });

});
