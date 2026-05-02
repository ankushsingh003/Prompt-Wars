import React, { useState, useEffect, useRef } from 'react';

const SYSTEM_PROMPT = `You are VoteIQ, an expert AI assistant about India's election process. 
You help citizens understand how elections work in India, covering:
- Lok Sabha (general elections) and Vidhan Sabha (state assembly) elections
- Voter registration process and Voter ID (EPIC card)
- Election Commission of India (ECI) role and powers
- Model Code of Conduct (MCC)
- Electronic Voting Machines (EVM) and VVPAT
- NOTA (None of the Above)
- Nomination, campaigning, polling, counting processes
- Government formation after elections
- Election disputes and legal processes
- Reservation of seats (SC/ST)
- Representation of People Act

Always respond in a friendly, clear, and educational tone. Keep responses concise (3-5 sentences max unless more detail is needed). Use simple language accessible to first-time voters. Add relevant emojis occasionally. Always be factually accurate based on ECI guidelines.`;

const QUESTIONS = [
  { q: "What is the minimum age to vote in Indian elections?", opts: ["16 years","18 years","21 years","25 years"], ans: 1, exp: "The Constitution of India (Article 326) grants the right to vote to all citizens aged 18 and above after the 61st Constitutional Amendment in 1988." },
  { q: "What does VVPAT stand for?", opts: ["Voter Verified Paper Audit Trail","Voting Verification Protocol and Technology","Verified Voter Paper Authentication Tool","Voter Validated Paper Archive Trail"], ans: 0, exp: "VVPAT (Voter Verified Paper Audit Trail) is a paper slip system attached to EVMs that lets voters verify their vote was recorded for the intended candidate." },
  { q: "How many seats does a party need to win an absolute majority in the Lok Sabha?", opts: ["201","250","272","300"], ans: 2, exp: "The Lok Sabha has 543 elected seats. A simple majority requires 272 seats (50%+1), which a party/alliance must secure to form the government independently." },
  { q: "What is the Model Code of Conduct (MCC)?", opts: ["A code for candidate behavior only","Guidelines issued by ECI that come into force when election schedule is announced","A law passed by Parliament for elections","Rules for the media to follow during elections"], ans: 1, exp: "The MCC is a set of guidelines issued by the Election Commission of India (ECI). It comes into effect when the election schedule is announced and restricts the ruling party from using government resources for campaigning." },
  { q: "What does NOTA stand for in Indian elections?", opts: ["No Option To Abstain","None Of The Above","No Outstanding Territorial Agenda","National Option To Abstain"], ans: 1, exp: "NOTA (None Of The Above) was introduced in 2013 after a Supreme Court ruling. It allows voters to reject all candidates, though it doesn't invalidate the election even if NOTA receives the most votes." },
  { q: "Which form is used to register as a new voter in India?", opts: ["Form 1","Form 6","Form 8","Form 3"], ans: 1, exp: "Form 6 is used by Indian citizens who are first-time voters or shifting to a new constituency. It can be submitted at voters.eci.gov.in or to the local BLO (Booth Level Officer)." },
  { q: "When must all election campaigning stop before polling day?", opts: ["24 hours","36 hours","48 hours","72 hours"], ans: 2, exp: "The Silent Period mandated by the ECI requires all election campaigning to stop 48 hours (2 days) before the scheduled polling time. This allows voters to make undisturbed decisions." },
  { q: "Which article of the Indian Constitution establishes universal adult franchise?", opts: ["Article 19","Article 21","Article 326","Article 352"], ans: 2, exp: "Article 326 of the Indian Constitution establishes the right to vote for all adult citizens, regardless of religion, race, caste, sex, or place of birth — the basis of universal adult franchise." },
];

const PARTIES = [
  { name: 'Indian National Congress', symbol: '✋', color: '#00BFFF' },
  { name: 'Bharatiya Janata Party', symbol: '🪷', color: '#FF9933' },
  { name: 'Aam Aadmi Party', symbol: '🧹', color: '#0000FF' },
  { name: 'Bahujan Samaj Party', symbol: '🐘', color: '#000080' },
  { name: 'Communist Party of India (M)', symbol: '☭', color: '#DE0000' },
  { name: 'NOTA', symbol: '🚫', color: '#333' }
];

import VotingPanel from './components/VotingPanel';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { getFallbackResponse, getQuizFeedback } from './utils/electionUtils';

function App() {
  // Navigation State
  const [activeNav, setActiveNav] = useState('hero');

  // Chat State
  const [messages, setMessages] = useState([
    { role: 'bot', text: `🙏 Jai Hind! I'm <strong>VoteIQ</strong>, your India election guide.<br/><br/>Ask me anything about:<ul><li>Voter registration & Voter ID</li><li>Lok Sabha & Vidhan Sabha elections</li><li>EVMs, VVPATs, and NOTA</li><li>Model Code of Conduct</li><li>How votes are counted</li></ul><br/>What would you like to know? 🇮🇳`, isHTML: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesRef = useRef(null);
  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

  // Quiz State
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();

  // Intersection Observers
  useEffect(() => {
    const fadeObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.2 });

    document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));
    document.querySelectorAll('.tl-item').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
      tlObs.observe(el);
    });

    return () => {
      fadeObs.disconnect();
      tlObs.disconnect();
    };
  }, []);

  // Scroll active nav
  useEffect(() => {
    const sections = ['hero', 'process', 'timeline', 'secure-voting', 'chatbot', 'quiz'];
    const handleScroll = () => {
      let current = '';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) current = id;
      });
      setActiveNav(current || 'hero');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chat Logic
  const sendMessage = async (textOverride) => {
    const text = textOverride || chatInput.trim();
    if (!text || isTyping) return;
    
    setChatInput('');
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'user', text }]);

    setTimeout(async () => {
      if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        const fallback = getFallbackResponse(text);
        setMessages(prev => [...prev, { role: 'bot', text: fallback, isHTML: true }]);
        setIsTyping(false);
      } else {
        try {
          const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
          const res = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
            })
          });
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not process that. Please try again.';
          setMessages(prev => [...prev, { role: 'bot', text: reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>'), isHTML: true }]);
        } catch (e) {
          setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Please check your API key and try again.', isHTML: false }]);
        }
        setIsTyping(false);
      }
    }, 900);
  };

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Quiz Logic
  const selectAnswer = (idx) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOpt(idx);
    if (idx === QUESTIONS[currentQ].ans) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ >= QUESTIONS.length - 1) {
      setShowResult(true);
    } else {
      setCurrentQ(prev => prev + 1);
      setAnswered(false);
      setSelectedOpt(null);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setAnswered(false);
    setSelectedOpt(null);
    setShowResult(false);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* NAV */}
      <nav>
        <div className="nav-logo">
          <span>Vote</span><span className="dot-saffron">I</span><span className="dot-green">Q</span>
        </div>
        <div className="nav-tabs">
          <button aria-label="Navigate to Home" className={`nav-tab ${activeNav === 'hero' ? 'active' : ''}`} onClick={() => scrollToSection('hero')}>Home</button>
          <button aria-label="Navigate to Process" className={`nav-tab ${activeNav === 'process' ? 'active' : ''}`} onClick={() => scrollToSection('process')}>Process</button>
          <button aria-label="Navigate to Timeline" className={`nav-tab ${activeNav === 'timeline' ? 'active' : ''}`} onClick={() => scrollToSection('timeline')}>Timeline</button>
          <button aria-label="Navigate to Secure Voting" className={`nav-tab ${activeNav === 'secure-voting' ? 'active' : ''}`} onClick={() => scrollToSection('secure-voting')}>Secure Voting</button>
          <button aria-label="Navigate to Ask AI" className={`nav-tab ${activeNav === 'chatbot' ? 'active' : ''}`} onClick={() => scrollToSection('chatbot')}>Ask AI</button>
          <button aria-label="Navigate to Quiz" className={`nav-tab ${activeNav === 'quiz' ? 'active' : ''}`} onClick={() => scrollToSection('quiz')}>Quiz</button>
          
          {user ? (
            <button aria-label="Logout" className="nav-tab logout-btn" onClick={logout}>
              <span className="user-initial">{user.displayName?.[0] || 'U'}</span> Logout
            </button>
          ) : (
            <button aria-label="Open Login Modal" className="nav-tab login-btn" onClick={() => setShowAuthModal(true)}>Login</button>
          )}
        </div>
        <div className="nav-badge">🇮🇳 India 2026</div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg"></div>
        <svg aria-hidden="true" className="hero-chakra" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" stroke="#000080" strokeWidth="3"/>
          <circle cx="100" cy="100" r="10" fill="#000080"/>
          <circle cx="100" cy="100" r="60" stroke="#000080" strokeWidth="1.5"/>
          <line x1="100" y1="10" x2="100" y2="190" stroke="#000080" strokeWidth="1.2"/>
          <line x1="10" y1="100" x2="190" y2="100" stroke="#000080" strokeWidth="1.2"/>
          <line x1="26" y1="26" x2="174" y2="174" stroke="#000080" strokeWidth="1.2"/>
          <line x1="174" y1="26" x2="26" y2="174" stroke="#000080" strokeWidth="1.2"/>
          <line x1="63" y1="10" x2="137" y2="190" stroke="#000080" strokeWidth="0.8"/>
          <line x1="137" y1="10" x2="63" y2="190" stroke="#000080" strokeWidth="0.8"/>
          <line x1="10" y1="63" x2="190" y2="137" stroke="#000080" strokeWidth="0.8"/>
          <line x1="10" y1="137" x2="190" y2="63" stroke="#000080" strokeWidth="0.8"/>
          <line x1="37" y1="15" x2="163" y2="185" stroke="#000080" strokeWidth="0.5"/>
          <line x1="163" y1="15" x2="37" y2="185" stroke="#000080" strokeWidth="0.5"/>
          <line x1="15" y1="37" x2="185" y2="163" stroke="#000080" strokeWidth="0.5"/>
          <line x1="15" y1="163" x2="185" y2="37" stroke="#000080" strokeWidth="0.5"/>
        </svg>
        <div className="hero-content fade-up">
          <div className="hero-eyebrow">India Election Guide</div>
          <h1 className="hero-title">
            Democracy<br/>
            <span className="line-saffron">Explained,</span><br/>
            <span className="line-green">Simply.</span>
          </h1>
          <p className="hero-sub">Your intelligent guide to understanding India's election process — from voter registration to result declaration, powered by AI.</p>
          <div className="hero-ctas">
            <button aria-label="Ask the AI Assistant" className="btn-primary" onClick={() => scrollToSection('chatbot')}>Ask the AI ✦</button>
            <button aria-label="Explore the Election Process" className="btn-outline" onClick={() => scrollToSection('process')}>Explore Process</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="num">96.8Cr</div><div className="lbl">Registered Voters</div></div>
            <div className="hero-stat"><div className="num">543</div><div className="lbl">Lok Sabha Seats</div></div>
            <div className="hero-stat"><div className="num">7</div><div className="lbl">Phase Election</div></div>
          </div>
        </div>
      </section>

      <div className="tricolor"><div className="s"></div><div className="w"></div><div className="g"></div></div>

      {/* PROCESS */}
      <section id="process">
        <div className="section-tag">Step by Step</div>
        <h2 className="section-title fade-up">How India Votes</h2>
        <p className="section-sub fade-up">From the announcement of elections to the swearing-in ceremony — every step of India's democratic process.</p>
        <div className="steps-grid">
          {[
            { num: '01', icon: '📣', title: 'Election Announcement', desc: 'The Election Commission of India (ECI) announces the election schedule. Model Code of Conduct (MCC) comes into effect immediately, restricting ruling party actions.', tag: 'ECI' },
            { num: '02', icon: '📋', title: 'Voter Registration', desc: 'Citizens aged 18+ can register on the Electoral Roll via Form 6. Voter ID (EPIC) is issued. Rolls are revised and published before every election.', tag: 'Voter ID' },
            { num: '03', icon: '📝', title: 'Nomination of Candidates', desc: 'Candidates file nominations with the Returning Officer. Nomination papers are scrutinized. Candidates can withdraw within a specified period after scrutiny.', tag: 'Candidates' },
            { num: '04', icon: '📢', title: 'Election Campaign', desc: 'Parties and candidates campaign across constituencies. Campaign must stop 48 hours before polling (Silent Period). Expenditure limits apply to all candidates.', tag: 'Campaigning' },
            { num: '05', icon: '🗳️', title: 'Polling Day', desc: 'Voters cast ballots using Electronic Voting Machines (EVM) and VVPAT (Voter Verified Paper Audit Trail). Public holidays are declared. ID proof is mandatory.', tag: 'EVM + VVPAT' },
            { num: '06', icon: '📊', title: 'Counting & Results', desc: 'Votes are counted on a designated date, usually a few days after polling ends. Candidates with the most votes in each constituency win (First Past the Post system).', tag: 'FPTP' },
            { num: '07', icon: '🏛️', title: 'Government Formation', desc: 'The party/alliance with 272+ seats (majority) in Lok Sabha forms the government. The President invites the leader to form the government and be sworn in as PM.', tag: 'Parliament' },
            { num: '08', icon: '⚖️', title: 'Disputes & Oversight', desc: 'Election disputes are heard by High Courts and the Supreme Court. The ECI has the power to countermand polls, order re-polls, and disqualify candidates for malpractice.', tag: 'ECI Powers' }
          ].map((step, i) => (
            <div className="step-card fade-up" key={i}>
              <div className="step-num">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
              <span className="step-tag">{step.tag}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="tricolor"><div className="s"></div><div className="w"></div><div className="g"></div></div>

      {/* TIMELINE */}
      <section id="timeline">
        <div className="section-tag">Election Calendar</div>
        <h2 className="section-title fade-up">Official Timeline</h2>
        <p className="section-sub fade-up">A typical Lok Sabha or Vidhan Sabha election unfolds over approximately 60–75 days from announcement to results.</p>
        <div className="timeline-wrapper">
          <div className="timeline-line"></div>
          <div className="timeline-items">
            {[
              { phase: 'Day 1', title: 'ECI Announcement', desc: 'Election schedule announced. Model Code of Conduct activated instantly.', duration: 'Duration: 1 day', side: 'left' },
              { phase: 'Day 1–7', title: 'Voter Roll Finalization', desc: 'Final electoral rolls published. Last chance to add/correct voter details.', duration: 'Duration: ~7 days', side: 'right', color: 'var(--green)' },
              { phase: 'Day 7–14', title: 'Nomination Filing', desc: 'Candidates file nominations with Returning Officers. Scrutiny of papers follows.', duration: 'Duration: ~7 days', side: 'left' },
              { phase: 'Day 14–17', title: 'Withdrawal Period', desc: 'Candidates can withdraw nominations. Final candidate list published.', duration: 'Duration: 3 days', side: 'right', color: 'var(--green)' },
              { phase: 'Day 17–43', title: 'Campaign Period', desc: 'Rallies, debates, door-to-door canvassing. Strict expenditure limits apply. Media campaigns run 24x7.', duration: 'Duration: ~26 days', side: 'left' },
              { phase: 'Day 43–44', title: 'Silent Period', desc: 'All campaigning stops 48 hours before polling begins. No new announcements allowed.', duration: 'Duration: 48 hours', side: 'right', color: 'var(--green)' },
              { phase: 'Day 45', title: '🗳️ Polling Day', desc: 'Voting from 7am to 6pm. EVMs and VVPATs used. Security forces deployed at all booths.', duration: 'One day (or multiple phases)', side: 'left', special: true },
              { phase: 'Day 48–50', title: '📊 Counting Day', desc: 'Votes counted round-wise. Results declared constituency by constituency. Winners announced.', duration: 'Duration: 1–2 days', side: 'right', color: 'var(--green)' },
              { phase: 'Day 55–60', title: '🏛️ Government Formation', desc: 'Majority party/alliance meets President. PM nominated and sworn in. Council of Ministers formed.', duration: 'Duration: ~5–10 days', side: 'left', specialGreen: true }
            ].map((item, i) => (
              <div className="tl-item" key={i}>
                <div className="tl-left">
                  {item.side === 'left' && (
                    <div className="tl-card">
                      <div className="tl-phase">{item.phase}</div>
                      <div className="tl-title">{item.title}</div>
                      <div className="tl-desc">{item.desc}</div>
                      <div className="tl-duration">{item.duration}</div>
                    </div>
                  )}
                </div>
                <div className="tl-center">
                  <div className="tl-dot" style={{ 
                    background: item.special ? 'var(--saffron)' : (item.color || 'var(--saffron)'),
                    boxShadow: item.special ? '0 0 0 3px var(--saffron), 0 0 20px rgba(255,107,0,0.4)' : `0 0 0 ${item.specialGreen ? '3px' : '2px'} ${item.color || 'var(--saffron)'}`,
                    width: (item.special || item.specialGreen) ? '22px' : '16px',
                    height: (item.special || item.specialGreen) ? '22px' : '16px'
                  }}></div>
                </div>
                <div className="tl-right">
                  {item.side === 'right' && (
                    <div className="tl-card" style={{ background: item.color ? 'var(--green-dim)' : '' }}>
                      <div className="tl-phase">{item.phase}</div>
                      <div className="tl-title">{item.title}</div>
                      <div className="tl-desc">{item.desc}</div>
                      <div className="tl-duration">{item.duration}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="tricolor"><div className="s"></div><div className="w"></div><div className="g"></div></div>

      {/* BLOCKCHAIN SECURE VOTING */}
      <VotingPanel />


      <div className="tricolor"><div className="s"></div><div className="w"></div><div className="g"></div></div>

      {/* CHATBOT */}
      <section id="chatbot">
        <div className="section-tag">AI Assistant</div>
        <h2 className="section-title fade-up">Ask VoteIQ Anything</h2>
        <p className="section-sub fade-up">Powered by Google Gemini — ask any question about India's election process in plain English.</p>

        <div className="chat-layout">
          <div className="chat-info fade-up">
            <p style={{ fontSize: '16px', color: 'var(--ink-2)', lineHeight: '1.7' }}>
              VoteIQ uses <strong>Google Gemini</strong> to answer questions about India's electoral system. Ask about voter registration, EVM technology, Model Code of Conduct, or anything related to how India votes.
            </p>
            <div className="chat-features">
              <div className="chat-feature"><div className="cf-icon">🤖</div><div>Powered by Google Gemini AI</div></div>
              <div className="chat-feature"><div className="cf-icon">🇮🇳</div><div>India-specific electoral knowledge</div></div>
              <div className="chat-feature"><div className="cf-icon">💬</div><div>Natural language Q&A</div></div>
              <div className="chat-feature"><div className="cf-icon">📚</div><div>Covers Lok Sabha & Vidhan Sabha</div></div>
            </div>
            <div className="chat-suggestions" style={{ marginTop: '24px' }}>
              <div className="sugg-label">Try asking:</div>
              <div className="sugg-chips">
                { [
                  'How do I register as a voter?', 'What is MCC?', 'How does EVM work?', 'What is NOTA?',
                  'Lok Sabha vs Vidhan Sabha', 'Who can contest?', 'Documents needed to vote', 'How votes are counted'
                ].map((s, i) => (
                  <button aria-label={`Ask about ${s}`} className="sugg-chip" key={i} onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="fade-up">
            <div className="chat-window">
              <div className="chat-header">
                <div className="chat-avatar">🗳️</div>
                <div>
                  <div className="chat-header-name">VoteIQ Assistant</div>
                  <div className="chat-header-status"><span className="status-dot"></span> Powered by Google Gemini</div>
                </div>
              </div>
              <div className="chat-messages" id="chatMessages" ref={chatMessagesRef}>
                {messages.map((m, i) => (
                  <div className={`msg ${m.role === 'user' ? 'user' : ''}`} key={i}>
                    <div className="msg-avatar">{m.role === 'user' ? '👤' : '🗳️'}</div>
                    {m.isHTML ? (
                      <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: m.text }}></div>
                    ) : (
                      <div className="msg-bubble">{m.text}</div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="msg" id="typingIndicator">
                    <div className="msg-avatar">🗳️</div>
                    <div className="msg-bubble"><div className="typing"><span></span><span></span><span></span></div></div>
                  </div>
                )}
              </div>
              <div className="chat-input-area">
                <input 
                  className="chat-input" 
                  value={chatInput} 
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about India's election process…" 
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  aria-label="Chat input"
                />
                <button aria-label="Send message" className="chat-send" onClick={() => sendMessage()}>➤</button>
              </div>
              <div className="api-note">Add your Gemini API key in App.jsx to enable AI responses</div>
            </div>
          </div>
        </div>
      </section>

      <div className="tricolor"><div className="s"></div><div className="w"></div><div className="g"></div></div>

      {/* QUIZ */}
      <section id="quiz">
        <div className="section-tag">Test Your Knowledge</div>
        <h2 className="section-title fade-up">Election Quiz</h2>
        <p className="section-sub fade-up">How well do you know India's electoral process? Take the quiz to find out!</p>

        <div className="quiz-box fade-up">
          <div className="quiz-progress">
            <div className="quiz-bar" style={{ width: `${showResult ? 100 : (currentQ / QUESTIONS.length) * 100 + 10}%` }}></div>
          </div>
          {!showResult ? (
            <div id="quizMain">
              <div className="quiz-q-num">Question {currentQ + 1} of {QUESTIONS.length}</div>
              <div className="quiz-q-text">{QUESTIONS[currentQ].q}</div>
              <div className="quiz-options">
                {QUESTIONS[currentQ].opts.map((o, i) => (
                  <button 
                    key={i} 
                    className={`quiz-opt ${answered ? (i === QUESTIONS[currentQ].ans ? 'correct' : (i === selectedOpt ? 'wrong' : '')) : ''}`}
                    onClick={() => selectAnswer(i)}
                    disabled={answered}
                    aria-label={`Option ${i + 1}: ${o}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              {answered && (
                <div className="quiz-feedback">
                  {selectedOpt === QUESTIONS[currentQ].ans ? '✅ Correct! ' : '❌ Wrong. '}
                  {QUESTIONS[currentQ].exp}
                </div>
              )}
              {answered && (
                <button aria-label="Next question" className="quiz-next" style={{ display: 'inline-block' }} onClick={nextQuestion}>
                  {currentQ >= QUESTIONS.length - 1 ? 'See Results' : 'Next Question →'}
                </button>
              )}
            </div>
          ) : (
            <div className="quiz-result" style={{ display: 'block' }}>
              <div className="quiz-score">{score}/{QUESTIONS.length}</div>
              <div className="quiz-score-label">
                {getQuizFeedback((score / QUESTIONS.length) * 100)}
              </div>
              <button aria-label="Retry quiz" className="quiz-retry" onClick={resetQuiz}>Try Again 🔄</button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="logo">Vote<span style={{ color: 'var(--saffron)' }}>I</span><span style={{ color: 'var(--green)' }}>Q</span></div>
        <p>An AI-powered guide to India's democratic process.<br/>
        Built for PromptWars Challenge 2 · Powered by Google Gemini<br/>
        <span style={{ opacity: 0.5, fontSize: '12px' }}>Data based on Election Commission of India guidelines</span>
        </p>
      </footer>
    </div>
  );
}

export default App;
