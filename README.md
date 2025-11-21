# JLPT N5 Grammar Practice - Star Questions

A web-based Japanese language learning application for practicing JLPT N5 grammar with interactive exercises.

## 🎯 Features

- **Practice Mode**: Interactive quiz with 15 random questions
- **Time Challenge**: Race against the clock with custom time limits
- **Study Mode**: Browse all 45 questions with answers and explanations
- **Statistics Tracking**: Track your progress across all sessions
- **Light/Dark Mode**: Toggle between themes for comfortable studying
- **Responsive Design**: Works on desktop, tablet, and mobile devices

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
├── index.html       # Main HTML structure
├── styles.css       # Styling (fall theme with light/dark mode)
├── app.js           # Application logic
├── questions.js     # 45 JLPT N5 practice questions
└── netlify.toml     # Netlify deployment configuration
```

## 🎮 How to Use

### Practice Mode
1. Click "Practice Mode" from the main menu
2. Answer 15 randomly selected questions
3. Select options in the correct order (1, 2, 3, 4)
4. Submit your answer to see if you're correct
5. View your final score and accuracy

### Time Challenge
1. Click "Time Challenge" from the main menu
2. Enter your desired time (minutes and seconds) or use quick presets
3. Answer as many questions as you can before time runs out
4. See your results including all incorrect answers for review

### Study Mode
1. Click "Study Mode" to browse all questions
2. Each question shows the correct answer and explanation
3. Navigate forward/backward through all 45 questions
4. Perfect for reviewing grammar patterns

### Statistics
- View your overall accuracy across all practice sessions
- See individual question performance
- Track which questions need more practice
- Statistics persist across browser sessions using localStorage

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

JLPT N5 is the most basic level of the Japanese Language Proficiency Test. This app focuses on the "star question" format where you arrange words in the correct grammatical order with one word marked by a star (★).

## 🛠️ Technologies Used

- Pure HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (no frameworks)
- LocalStorage API for data persistence
- HTML Ruby tags for furigana display

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

This is a learning project. Feel free to fork and modify for your own use!

---

Happy studying! 頑張ってください！🇯🇵🍂

<!-- Redeploy trigger: updated README to refresh Netlify edge cache -->
