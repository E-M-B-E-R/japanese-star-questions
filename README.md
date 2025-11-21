# JLPT N5 Grammar Practice - Star Questions

A web-based Japanese language learning application for practicing JLPT N5 grammar with interactive exercises.

## 🎯 Features

- **Practice Mode**: Interactive quiz with customizable question count (1-48 questions)
- **Time Challenge**: Race against the clock with custom time limits and live stats
- **Review Mode**: Browse all 48 questions with answers and explanations
- **Statistics Tracking**: Track your progress with detailed accuracy metrics per question
- **Targeted Practice**: Select specific questions from statistics to practice weak areas
- **Debug Mode**: Test individual questions by number for focused practice
- **Light/Dark Mode**: Toggle between themes for comfortable studying
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Detailed Results**: See incorrect answers with highlighted mistakes after each session

## 🚀 Running the Project

### Option 1: Open Directly in Browser
The simplest way to run this project:

1. Navigate to the project folder
2. Double-click `index.html` or right-click and select "Open With" → your browser
3. The app will open and run completely in your browser

### Option 2: Using a Local Server (Recommended)

For the best experience, use a local web server:

**Python 3:**
```bash
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (using npx):**
```bash
npx http-server
```

**VS Code:**
- Install the "Live Server" extension
- Right-click on `index.html`
- Select "Open with Live Server"

Then open your browser to `http://localhost:8000` (or the port shown in your terminal).

## 📁 Project Structure

```
.
├── index.html           # Main HTML structure
├── styles.css           # Styling (fall theme with light/dark mode)
├── app.js               # Application logic
├── questions.js         # 48 JLPT N5 practice questions
├── scripts/
│   └── hash-assets.js   # Build script for cache-busting
├── package.json         # NPM scripts for deployment
├── netlify.toml         # Netlify deployment configuration
└── .gitignore           # Excludes generated build files
```

## 🎮 How to Use

### Practice Mode
1. Click "Practice Mode" from the main menu
2. Choose how many questions you want to practice (1-48, default 15)
3. Select word options in the correct order to fill in the blanks
4. Submit your answer to see if you're correct
5. Review detailed feedback showing:
   - Your answer with incorrect words highlighted in red
   - The correct answer
   - Translation and grammar explanation
6. View final results with a complete breakdown of incorrect/skipped questions

### Time Challenge
1. Click "Time Challenge" from the main menu
2. Set your timer (minutes and seconds) or use quick presets (1-10 minutes)
3. Answer as many questions as possible before time runs out
4. Watch live stats: questions answered and correct count
5. Time's up triggers fall-themed confetti animation 🍂
6. Review all incorrect answers with detailed explanations

### Review Mode
1. Click "Review Mode" to see a list of all 48 questions
2. Click any question to view it with the complete answer
3. Each question shows:
   - Correct word order with blanks filled
   - Translation
   - Grammar point explanation
4. Navigate between questions or return to the list

### Statistics
1. View overall performance metrics:
   - Total attempts across all sessions
   - Correct/incorrect counts
   - Overall accuracy percentage
2. See detailed per-question statistics sorted by accuracy
3. Select questions with accuracy < 60% automatically
4. Multi-select specific questions to practice
5. Start a targeted practice session with selected questions only
6. Clear all statistics if you want to start fresh

### Debug Mode
1. Click "Debug Mode" from the main menu
2. Enter a specific question number (1-48)
3. Practice that single question repeatedly
4. Perfect for focusing on particularly challenging grammar points

## 🎨 Theme Toggle

Click the theme button in the top-right corner to switch between:
- **Light Mode** 🌙 - Bright interface with fall colors
- **Dark Mode** ☀️ - Darker interface optimized for low-light studying

## 💾 Data Storage

All progress and statistics are saved locally in your browser using localStorage:
- No account required
- No internet connection needed after initial load
- Data persists across sessions
- Clear browser data to reset statistics

## 🌐 Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 📱 Mobile Support

Fully responsive design optimized for:
- Smartphones (iPhone, Android)
- Tablets (iPad, Android tablets)
- Desktop computers

## 🎓 About JLPT N5

JLPT N5 is the most basic level of the Japanese Language Proficiency Test. This app focuses on word-order questions where you arrange four words in the correct grammatical sequence to complete a sentence. Some questions include dialogue context (A: / B:) to practice conversational patterns.

## 🛠️ Technologies Used

- Pure HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (no frameworks)
- LocalStorage API for data persistence
- HTML Ruby tags for furigana (reading aids) display
- Node.js build script for asset fingerprinting
- Netlify for hosting with atomic deploys

## 🚀 Deployment

The app uses automated asset fingerprinting for optimal caching:

1. During build, `npm run hash-assets` generates content-hashed copies of JS/CSS files
2. `index.html` references are updated to point to fingerprinted assets
3. Netlify serves with long-lived cache headers for immutable assets
4. Each deploy automatically updates asset references for cache-busting

To deploy your own copy:
1. Fork this repository
2. Connect to Netlify
3. Build command: `npm run hash-assets`
4. Publish directory: `.`
5. Deploy!

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a learning project. Feel free to fork and modify for your own use!

---

Happy studying! 頑張ってください！🇯🇵🍂
