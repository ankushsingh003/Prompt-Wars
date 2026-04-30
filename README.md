# Prompt-Wars 2 — VoteIQ Election Assistant 🇮🇳

VoteIQ is a premium, AI-powered election guide designed to simplify the democratic process in India. From voter registration to result declaration, VoteIQ provides an intelligent, interactive, and visually stunning experience for citizens.

![VoteIQ Header](https://raw.githubusercontent.com/ankushsingh003/Prompt-Wars/main/voteiq-app/src/assets/hero.png) 

## 🌟 Key Features

### 🤖 AI-Powered Assistant (VoteIQ Bot)
Powered by **Google Gemini**, the VoteIQ assistant answers complex questions about India's electoral system in plain English. Ask about:
- Voter registration and EPIC cards.
- Difference between Lok Sabha and Vidhan Sabha.
- How EVMs and VVPATs work.
- The Model Code of Conduct (MCC).

### 🗳️ Step-by-Step Process Guide
A comprehensive breakdown of the 8 critical stages of the Indian election process, from announcement to government formation.

### 📅 Official Election Timeline
A dynamic, scroll-animated timeline that visualizes the typical 60–75 day election calendar, highlighting major milestones like Polling Day and Counting Day.

### 🧠 Interactive Election Quiz
Test your democratic knowledge with a full-fledged quiz. Includes instant feedback and a detailed scoring system to see if you're an "Election Expert."

## 🚀 Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS with a Custom Design System
- **AI Engine**: [Google Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/)
- **Animations**: CSS Transitions + Intersection Observer API

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ankushsingh003/Prompt-Wars.git
   cd Prompt-Wars
   ```

2. **Navigate to the App directory**:
   ```bash
   cd voteiq-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Enable AI (Optional)**:
   Add your Google Gemini API key in `src/App.jsx` to enable full-fledged AI responses.

## 📁 Project Structure

```text
├── voteiq-app/             # Modern React Application
│   ├── src/
│   │   ├── App.jsx         # Main Logic & Components
│   │   ├── index.css       # Design System & Styling
│   │   └── main.jsx        # Entry point
│   └── index.html          # App entry
├── VoteIQ-Election-Assistant.html # Original Standalone Version
└── README.md               # You are here
```

## 🎨 Design Aesthetics
VoteIQ uses a curated "Tricolor" design system inspired by the Indian National Flag:
- **Saffron**: Represents courage and sacrifice.
- **Green**: Represents growth and prosperity.
- **Navy Blue**: Represents the Dharma Chakra (Wheel of Law).
- **Glassmorphism**: Modern, blurred overlays for a premium feel.
- **Rich Animations**: Smooth scroll-triggered fade-ins and interactive micro-animations.

---
Built with ❤️ for **Prompt-Wars Challenge 2** · Powered by **Google Gemini**
