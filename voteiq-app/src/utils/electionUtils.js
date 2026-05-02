/**
 * Utility functions for election-related logic
 */

/**
 * Returns a fallback response for the chatbot based on keywords.
 */
export const getFallbackResponse = (query) => {
  const q = query.toLowerCase();
  if (q.includes('register') || q.includes('voter id') || q.includes('epic'))
    return `📋 <strong>Voter Registration:</strong> You can register as a voter if you are an Indian citizen aged 18+. Fill <strong>Form 6</strong> on the National Voters' Service Portal (voters.eci.gov.in) or visit your local BLO (Booth Level Officer). You'll receive an <strong>EPIC card (Voter ID)</strong> within a few weeks.`;
  
  if (q.includes('evm') || q.includes('electronic voting'))
    return `⚡ <strong>EVMs (Electronic Voting Machines)</strong> are standalone battery-operated devices that record votes electronically. paired with <strong>VVPATs</strong> since 2019.`;
  
  if (q.includes('nota'))
    return `🚫 <strong>NOTA (None Of The Above)</strong> allows voters to reject all candidates. Even if NOTA wins, the next highest candidate is declared winner.`;
  
  return `🇮🇳 Ask me about voter registration, EVMs, or election rules!`;
};

/**
 * Calculates the percentage score for the quiz.
 */
export const calculatePercentage = (score, total) => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

/**
 * Returns a feedback message based on score percentage.
 */
export const getQuizFeedback = (percentage) => {
  if (percentage >= 85) return '🏆 Excellent! You\'re an election expert!';
  if (percentage >= 60) return '👍 Good job! You know your democracy well.';
  if (percentage >= 35) return '📚 Not bad! Read up a bit more.';
  return '📖 Keep learning about your democratic rights!';
};
