/**
 * useAnalytics — wraps Firebase Analytics & Performance Monitoring.
 * Provides safe no-ops when Firebase is not configured.
 */
import { analytics } from '../firebase/config';

let logEventFn = null;
let traceFn = null;

// Lazy import so the module doesn't crash when analytics is undefined
const getAnalyticsFns = async () => {
  if (!analytics) return;
  try {
    const { logEvent } = await import('firebase/analytics');
    logEventFn = (eventName, params) => logEvent(analytics, eventName, params);
  } catch (e) {
    console.warn('Analytics not available:', e.message);
  }
};

getAnalyticsFns();

export function useAnalytics() {
  /**
   * Track a named event with optional parameters.
   * @param {string} eventName - Firebase Analytics event name
   * @param {object} [params]  - Key/value pairs attached to the event
   */
  const trackEvent = (eventName, params = {}) => {
    if (logEventFn) {
      try {
        logEventFn(eventName, params);
      } catch (e) {
        console.warn('trackEvent failed:', e.message);
      }
    }
  };

  /**
   * Track page views when the user navigates between sections.
   * @param {string} sectionId - The section id scrolled into view
   */
  const trackPageView = (sectionId) => {
    trackEvent('page_view', { page_title: sectionId, page_location: window.location.href });
  };

  /**
   * Track quiz completion.
   * @param {number} score   - Number of correct answers
   * @param {number} total   - Total questions
   */
  const trackQuizComplete = (score, total) => {
    trackEvent('quiz_complete', { score, total, percentage: Math.round((score / total) * 100) });
  };

  /**
   * Track when a user casts a vote (no personal data).
   */
  const trackVoteCast = () => {
    trackEvent('vote_cast', { method: 'blockchain_relay' });
  };

  /**
   * Track chatbot interactions.
   * @param {string} queryType - Category of question asked
   */
  const trackChatQuery = (queryType) => {
    trackEvent('chat_query', { query_type: queryType });
  };

  return { trackEvent, trackPageView, trackQuizComplete, trackVoteCast, trackChatQuery };
}
