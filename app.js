// app.js - Main application logic

// State management
let currentMode = 'menu';
let currentQuestionIndex = 0;
let practiceQuestions = [];
let selectedOrder = [];
let score = 0;
let currentAnswer = null;
let practiceAnsweredQuestions = [];

// Timer mode state
let timerSeconds = 0;
let timerInterval = null;
let timerQuestions = [];
let timerSelectedOrder = [];
let timerAnsweredQuestions = [];
let timerCorrectCount = 0;
let timerTotalCount = 0;

// LocalStorage keys
const STATS_KEY = 'jlpt_n5_stats';
const THEME_KEY = 'jlpt_n5_theme';

// Theme toggle function
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
        localStorage.setItem(THEME_KEY, 'light');
    } else {
        body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
        localStorage.setItem(THEME_KEY, 'dark');
    }
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').textContent = '☀️';
        document.getElementById('theme-text').textContent = 'Light Mode';
    }
});

// Convert furigana format "漢字(かんじ)" to HTML ruby tags
function parseRuby(text) {
    if (!text) return '';
    
    // Replace 漢字(ふりがな) with <ruby>漢字<rt>ふりがな</rt></ruby>
    // This regex now captures only kanji/katakana before the parentheses, preserving hiragana
    return text.replace(/([一-龯ァ-ヶｦ-ﾟ々〆〤]+)\(([^)]+)\)/g, '<ruby>$1<rt>$2</rt></ruby>');
}

// Generate blanks for question display based on number of options
function generateBlanks(numOptions, starPosition) {
    let blanks = [];
    for (let i = 0; i < numOptions; i++) {
        if (i === starPosition) {
            blanks.push('<span class="star-placeholder">★</span>');
        } else {
            blanks.push('___');
        }
    }
    return blanks.join(' ');
}

// Get statistics from localStorage
function loadStats() {
    const stats = localStorage.getItem(STATS_KEY);
    return stats ? JSON.parse(stats) : {};
}

// Save statistics to localStorage
function saveStats(stats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Record an answer
function recordAnswer(question, isCorrect) {
    const stats = loadStats();
    const key = `${question.beforeStar} ${question.afterStar}`;
    
    // Find question number
    const questionNumber = PRACTICE_QUESTIONS.findIndex(q => 
        q.beforeStar === question.beforeStar && 
        q.afterStar === question.afterStar &&
        JSON.stringify(q.correctOrder) === JSON.stringify(question.correctOrder)
    ) + 1;
    
    // Build the complete answer without stars
    const correctSequence = question.correctOrder.map(i => question.options[i - 1]);
    let fullAnswer = question.beforeStar + ' ';
    correctSequence.forEach((word) => {
        fullAnswer += `${word} `;
    });
    fullAnswer += question.afterStar;
    
    if (!stats[key]) {
        stats[key] = {
            correct: 0,
            incorrect: 0,
            total: 0,
            translation: question.translation,
            fullAnswer: fullAnswer,
            questionNumber: questionNumber
        };
    }
    
    if (isCorrect) {
        stats[key].correct++;
    } else {
        stats[key].incorrect++;
    }
    stats[key].total++;
    
    saveStats(stats);
}

// Show/hide screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    currentMode = screenId;
    
    // Remove focus from any element to prevent cursor blinking
    setTimeout(() => {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
        // Also focus the body to ensure nothing else has focus
        document.body.focus();
        document.body.blur();
    }, 0);
}

// Back to main menu
function backToMenu() {
    // First blur any active element
    if (document.activeElement) {
        document.activeElement.blur();
    }
    
    showScreen('main-menu');
    
    // Blur again after screen change and remove all focus
    setTimeout(() => {
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(btn => btn.blur());
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }, 50);
}

// Start practice mode
function startPracticeMode() {
    // Shuffle and select 15 random questions
    const shuffled = [...PRACTICE_QUESTIONS].sort(() => Math.random() - 0.5);
    practiceQuestions = shuffled.slice(0, 15);
    currentQuestionIndex = 0;
    score = 0;
    selectedOrder = [];
    practiceAnsweredQuestions = [];
    
    showScreen('practice-screen');
    displayPracticeQuestion();
}

// Display current practice question
function displayPracticeQuestion() {
    const question = practiceQuestions[currentQuestionIndex];
    const container = document.getElementById('question-container');
    
    // Find question number in main array
    const questionNumber = PRACTICE_QUESTIONS.findIndex(q => 
        q.beforeStar === question.beforeStar && 
        q.afterStar === question.afterStar &&
        JSON.stringify(q.correctOrder) === JSON.stringify(question.correctOrder)
    ) + 1;
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / practiceQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('question-counter').textContent = 
        `Question ${currentQuestionIndex + 1}/${practiceQuestions.length}`;
    
    // Reset selected order
    selectedOrder = [];
    
    // Build question HTML
    let html = '<div class="question-display">';
    html += `<div style="color: #ff6b35; font-weight: bold; margin-bottom: 10px;">Question #${questionNumber}</div>`;
    
    if (question.isDialogue) {
        html += `<div class="dialogue-label">Complete Speaker B's response:</div>`;
        html += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
        html += `<div class="question-text">B: ${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    } else {
        html += `<div class="dialogue-label">Arrange the words in the correct order:</div>`;
        html += `<div class="question-text">${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    }
    
    html += '</div>';
    html += '<div class="options-grid">';
    
    question.optionsFurigana.forEach((option, index) => {
        html += `<div class="option-card" onclick="selectOption(${index + 1})" id="option-${index + 1}">
            ${parseRuby(option)}
            <span class="order-number hidden" id="order-${index + 1}"></span>
        </div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Show/hide buttons and re-enable submit button
    const submitBtn = document.getElementById('submit-answer');
    submitBtn.classList.remove('hidden');
    submitBtn.disabled = false;
    document.getElementById('next-question').classList.add('hidden');
}

// Select an option
function selectOption(optionNum) {
    const optionCard = document.getElementById(`option-${optionNum}`);
    const orderSpan = document.getElementById(`order-${optionNum}`);
    
    // If already selected, deselect
    const currentIndex = selectedOrder.indexOf(optionNum);
    if (currentIndex !== -1) {
        selectedOrder.splice(currentIndex, 1);
        optionCard.classList.remove('selected');
        orderSpan.classList.add('hidden');
        
        // Update remaining order numbers
        selectedOrder.forEach((num, idx) => {
            document.getElementById(`order-${num}`).textContent = idx + 1;
        });
    } else if (selectedOrder.length < 4) {
        // Add to selection
        selectedOrder.push(optionNum);
        optionCard.classList.add('selected');
        orderSpan.textContent = selectedOrder.length;
        orderSpan.classList.remove('hidden');
    }
}

// Submit answer
function submitAnswer() {
    if (selectedOrder.length !== 4) {
        alert('Please select all 4 options in order');
        return;
    }
    
    // Disable buttons to prevent multiple submissions
    const submitBtn = document.getElementById('submit-answer');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    
    const question = practiceQuestions[currentQuestionIndex];
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(question.correctOrder);
    
    if (isCorrect) {
        score++;
    }
    
    // Store question details for results
    practiceAnsweredQuestions.push({
        question: question,
        userAnswer: selectedOrder,
        isCorrect: isCorrect
    });
    
    // Record the answer
    recordAnswer(question, isCorrect);
    
    // Show answer
    showAnswer(question, isCorrect);
    
    // Hide submit, show next
    submitBtn.classList.add('hidden');
    document.getElementById('next-question').classList.remove('hidden');
}

// Show answer
function showAnswer(question, isCorrect) {
    const container = document.getElementById('question-container');
    const correctSequence = question.correctOrder.map(i => question.optionsFurigana[i - 1]);
    
    let answerHtml = `<div class="answer-section ${isCorrect ? 'correct' : 'incorrect'}">`;
    answerHtml += `<div class="answer-header">${isCorrect ? '◯ CORRECT!' : '✕ Not quite right'}</div>`;
    
    if (question.isDialogue) {
        answerHtml += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
    }
    
    answerHtml += '<div class="correct-answer">';
    answerHtml += question.isDialogue ? 'B: ' : '';
    answerHtml += parseRuby(question.beforeStarFurigana) + ' ';
    
    if (!isCorrect) {
        // Show user's incorrect answer with wrong parts highlighted
        const userSequence = selectedOrder.map(i => question.optionsFurigana[i - 1]);
        userSequence.forEach((word, idx) => {
            if (selectedOrder[idx] !== question.correctOrder[idx]) {
                answerHtml += `<span class="incorrect-word">${parseRuby(word)}</span> `;
            } else {
                answerHtml += `${parseRuby(word)} `;
            }
        });
        answerHtml += parseRuby(question.afterStarFurigana);
        answerHtml += '</div>';
        answerHtml += '<div style="margin-top: 15px; font-weight: bold; color: #28a745;">Correct order:</div>';
        answerHtml += '<div class="correct-answer">';
        answerHtml += question.isDialogue ? 'B: ' : '';
        answerHtml += parseRuby(question.beforeStarFurigana) + ' ';
    }
    
    correctSequence.forEach((word) => {
        answerHtml += `${parseRuby(word)} `;
    });
    
    answerHtml += parseRuby(question.afterStarFurigana);
    answerHtml += '</div>';
    
    answerHtml += `<div class="translation"><strong>📖 Translation:</strong> ${question.translation}</div>`;
    answerHtml += `<div class="explanation"><strong>💡 Grammar Point:</strong> ${question.explanation}</div>`;
    answerHtml += '</div>';
    
    container.innerHTML += answerHtml;
}

// Next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < practiceQuestions.length) {
        displayPracticeQuestion();
    } else {
        showResults();
    }
}

// Skip question
function skipQuestion() {
    // Disable submit button to prevent multiple skips
    const submitBtn = document.getElementById('submit-answer');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    
    const question = practiceQuestions[currentQuestionIndex];
    
    // Store skipped question details for results
    practiceAnsweredQuestions.push({
        question: question,
        userAnswer: [],
        isCorrect: false
    });
    
    showAnswer(question, false);
    submitBtn.classList.add('hidden');
    document.getElementById('next-question').classList.remove('hidden');
}

// Show results
function showResults() {
    showScreen('results-screen');
    const container = document.getElementById('results-container');
    
    const percentage = (score / practiceQuestions.length * 100).toFixed(1);
    
    let message = '';
    if (score === practiceQuestions.length) {
        message = "🌟 Perfect! You're ready for N5! 🌟";
    } else if (score >= practiceQuestions.length * 0.8) {
        message = "👍 Great work! Keep practicing!";
    } else if (score >= practiceQuestions.length * 0.6) {
        message = "📚 Good progress! Review the explanations and try again.";
    } else {
        message = "💪 Keep studying! Practice makes perfect!";
    }
    
    let html = `
        <div class="score-display">${score}/${practiceQuestions.length}</div>
        <div class="results-message">${percentage}% Correct</div>
        <div class="results-message">${message}</div>
    `;
    
    // Show incorrect questions if any
    const incorrectAnswers = practiceAnsweredQuestions.filter(a => !a.isCorrect);
    if (incorrectAnswers.length > 0) {
        html += `
            <div style="margin-top: 30px; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto;">
                <h3 style="color: #dc3545; margin-bottom: 20px;">Questions to Review (${incorrectAnswers.length}):</h3>
        `;
        
        incorrectAnswers.forEach(({question, userAnswer}) => {
            const questionNumber = PRACTICE_QUESTIONS.findIndex(q => 
                q.beforeStar === question.beforeStar && q.translation === question.translation
            ) + 1;
            
            const correctSequence = question.correctOrder.map(idx => question.optionsFurigana[idx - 1]);
            
            html += `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
                    <div style="color: #ff6b35; font-weight: bold; margin-bottom: 10px;">Question #${questionNumber}</div>
            `;
            
            if (question.isDialogue) {
                html += `<div style="margin-bottom: 10px;"><strong>A:</strong> ${parseRuby(question.speakerAFurigana)}</div>`;
                html += `<div style="margin-bottom: 10px;"><strong>B:</strong> ${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
            } else {
                html += `<div style="margin-bottom: 10px;">${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
            }
            
            html += `<div style="color: #666; margin-bottom: 15px; font-style: italic;">${question.translation}</div>`;
            
            html += `<div style="font-weight: bold; color: #28a745; margin-bottom: 5px;">Correct Answer:</div>`;
            html += `<div style="margin-bottom: 10px;">`;
            if (question.isDialogue) {
                html += `<strong>B:</strong> `;
            }
            html += parseRuby(question.beforeStarFurigana) + ' ';
            correctSequence.forEach(word => {
                html += parseRuby(word) + ' ';
            });
            html += parseRuby(question.afterStarFurigana);
            html += `</div>`;
            
            html += `</div>`;
        });
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

// Quit practice
function quitPractice() {
    if (confirm('Are you sure you want to quit? Your progress will not be saved.')) {
        // Blur the button that was clicked
        setTimeout(() => {
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }, 0);
        backToMenu();
    }
}

// ==================== TIMER MODE FUNCTIONS ====================

// Show timer setup screen
function showTimerSetup() {
    showScreen('timer-setup-screen');
}

// Set timer preset values
function setTimerPreset(minutes, seconds) {
    document.getElementById('minutes-input').value = minutes;
    document.getElementById('seconds-input').value = seconds;
}

// Start timer mode from input fields
function startTimerModeFromInput() {
    const minutes = parseInt(document.getElementById('minutes-input').value) || 0;
    const seconds = parseInt(document.getElementById('seconds-input').value) || 0;
    
    const totalSeconds = (minutes * 60) + seconds;
    
    // Validate input
    if (totalSeconds <= 0) {
        alert('Please enter a time greater than 0 seconds!');
        return;
    }
    
    if (totalSeconds > 3600) {
        alert('Maximum time is 60 minutes (3600 seconds)!');
        return;
    }
    
    startTimerMode(totalSeconds);
}

// Start timer mode with specified duration
function startTimerMode(seconds) {
    // Initialize timer state
    timerSeconds = seconds;
    timerQuestions = [...PRACTICE_QUESTIONS].sort(() => Math.random() - 0.5);
    currentQuestionIndex = 0;
    timerAnsweredQuestions = [];
    timerCorrectCount = 0;
    timerTotalCount = 0;
    timerSelectedOrder = [];
    
    // Show timer screen and start countdown
    showScreen('timer-screen');
    displayTimerQuestion();
    startTimer();
}

// Start the countdown timer
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            endTimerMode();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer-countdown').textContent = display;
    
    // Add warning style when time is running out
    const timerDisplay = document.querySelector('.timer-display');
    if (timerSeconds <= 10) {
        timerDisplay.classList.add('timer-warning');
    } else {
        timerDisplay.classList.remove('timer-warning');
    }
}

// Update timer stats display
function updateTimerStats() {
    document.getElementById('timer-question-count').textContent = `Questions: ${timerTotalCount}`;
    document.getElementById('timer-correct-count').textContent = `Correct: ${timerCorrectCount}`;
}

// Display current timer question
function displayTimerQuestion() {
    // Check if we've run out of questions
    if (currentQuestionIndex >= timerQuestions.length) {
        endTimerMode();
        return;
    }
    
    const question = timerQuestions[currentQuestionIndex];
    const container = document.getElementById('timer-question-container');
    
    // Find question number in main array
    const questionNumber = PRACTICE_QUESTIONS.findIndex(q => 
        q.beforeStar === question.beforeStar && 
        q.afterStar === question.afterStar &&
        JSON.stringify(q.correctOrder) === JSON.stringify(question.correctOrder)
    ) + 1;
    
    // Reset selected order
    timerSelectedOrder = [];
    
    // Build question HTML (similar to practice mode)
    let html = '<div class="question-display">';
    html += `<div style="color: #ff6b35; font-weight: bold; margin-bottom: 10px;">Question #${questionNumber}</div>`;
    
    if (question.isDialogue) {
        html += `<div class="dialogue-label">Complete Speaker B's response:</div>`;
        html += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
        html += `<div class="question-text">B: ${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    } else {
        html += `<div class="dialogue-label">Arrange the words in the correct order:</div>`;
        html += `<div class="question-text">${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    }
    
    html += '</div>';
    html += '<div class="options-grid">';
    
    question.optionsFurigana.forEach((option, index) => {
        html += `<div class="option-card" onclick="selectTimerOption(${index + 1})" id="timer-option-${index + 1}">
            ${parseRuby(option)}
            <span class="order-number hidden" id="timer-order-${index + 1}"></span>
        </div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Show/hide buttons and re-enable submit button
    const submitBtn = document.getElementById('timer-submit-answer');
    submitBtn.classList.remove('hidden');
    submitBtn.disabled = false;
    document.getElementById('timer-next-question').classList.add('hidden');
}

// Select an option in timer mode
function selectTimerOption(optionNum) {
    const optionCard = document.getElementById(`timer-option-${optionNum}`);
    const orderSpan = document.getElementById(`timer-order-${optionNum}`);
    
    // If already selected, deselect
    const currentIndex = timerSelectedOrder.indexOf(optionNum);
    if (currentIndex !== -1) {
        timerSelectedOrder.splice(currentIndex, 1);
        optionCard.classList.remove('selected');
        orderSpan.classList.add('hidden');
        
        // Update remaining order numbers
        timerSelectedOrder.forEach((num, idx) => {
            document.getElementById(`timer-order-${num}`).textContent = idx + 1;
        });
    } else if (timerSelectedOrder.length < 4) {
        // Add to selection
        timerSelectedOrder.push(optionNum);
        optionCard.classList.add('selected');
        orderSpan.classList.remove('hidden');
        orderSpan.textContent = timerSelectedOrder.length;
    }
}

// Submit timer answer
function submitTimerAnswer() {
    if (timerSelectedOrder.length !== 4) {
        alert('Please select all 4 options in order');
        return;
    }
    
    // Disable buttons to prevent multiple submissions
    const submitBtn = document.getElementById('timer-submit-answer');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    
    const question = timerQuestions[currentQuestionIndex];
    const isCorrect = JSON.stringify(timerSelectedOrder) === JSON.stringify(question.correctOrder);
    
    // Record the answer
    timerTotalCount++;
    if (isCorrect) {
        timerCorrectCount++;
    }
    
    // Store question details for final report
    timerAnsweredQuestions.push({
        question: question,
        userAnswer: timerSelectedOrder,
        isCorrect: isCorrect
    });
    
    // Update statistics
    updateTimerStats();
    recordAnswer(question, isCorrect);
    
    // Show answer
    showTimerAnswer(question, isCorrect);
    
    // Update buttons
    submitBtn.classList.add('hidden');
    document.getElementById('timer-next-question').classList.remove('hidden');
}

// Show answer in timer mode
function showTimerAnswer(question, isCorrect) {
    const container = document.getElementById('timer-question-container');
    
    const correctSequence = question.correctOrder.map(idx => question.optionsFurigana[idx - 1]);
    
    let answerHtml = '<div class="answer-section ' + (isCorrect ? 'correct' : 'incorrect') + '">';
    answerHtml += `<div class="answer-header">${isCorrect ? '◯ CORRECT!' : '✕ Not quite right'}</div>`;
    
    if (question.isDialogue) {
        answerHtml += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
    }
    
    answerHtml += '<div class="correct-answer">';
    answerHtml += question.isDialogue ? 'B: ' : '';
    answerHtml += parseRuby(question.beforeStarFurigana) + ' ';
    
    if (!isCorrect) {
        // Show user's incorrect answer with wrong parts highlighted
        const userSequence = timerSelectedOrder.map(i => question.optionsFurigana[i - 1]);
        userSequence.forEach((word, idx) => {
            if (timerSelectedOrder[idx] !== question.correctOrder[idx]) {
                answerHtml += `<span class="incorrect-word">${parseRuby(word)}</span> `;
            } else {
                answerHtml += `${parseRuby(word)} `;
            }
        });
        answerHtml += parseRuby(question.afterStarFurigana);
        answerHtml += '</div>';
        answerHtml += '<div style="margin-top: 15px; font-weight: bold; color: #28a745;">Correct order:</div>';
        answerHtml += '<div class="correct-answer">';
        answerHtml += question.isDialogue ? 'B: ' : '';
        answerHtml += parseRuby(question.beforeStarFurigana) + ' ';
    }
    
    correctSequence.forEach((word) => {
        answerHtml += `${parseRuby(word)} `;
    });
    
    answerHtml += parseRuby(question.afterStarFurigana);
    answerHtml += '</div>';
    
    answerHtml += `<div class="translation"><strong>📖 Translation:</strong> ${question.translation}</div>`;
    answerHtml += '</div>';
    
    container.innerHTML += answerHtml;
}

// Next timer question
function nextTimerQuestion() {
    currentQuestionIndex++;
    displayTimerQuestion();
}

// Skip timer question
function skipTimerQuestion() {
    // Disable submit button to prevent multiple skips
    const submitBtn = document.getElementById('timer-submit-answer');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    
    const question = timerQuestions[currentQuestionIndex];
    
    // Record as incorrect
    timerTotalCount++;
    timerAnsweredQuestions.push({
        question: question,
        userAnswer: [],
        isCorrect: false
    });
    
    updateTimerStats();
    recordAnswer(question, false);
    showTimerAnswer(question, false);
    
    submitBtn.classList.add('hidden');
    document.getElementById('timer-next-question').classList.remove('hidden');
}

// End timer mode (time's up or ran out of questions)
function endTimerMode() {
    // Stop the timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Show results and trigger confetti
    showTimerResults();
    triggerFallConfetti();
}

// Show timer results
function showTimerResults() {
    showScreen('timer-results-screen');
    const container = document.getElementById('timer-results-container');
    
    const percentage = timerTotalCount > 0 ? (timerCorrectCount / timerTotalCount * 100).toFixed(1) : 0;
    
    let message = '';
    if (timerCorrectCount === timerTotalCount && timerTotalCount > 0) {
        message = "🌟 Perfect! You didn't miss a single question! 🌟";
    } else if (percentage >= 80) {
        message = "⚡ Excellent speed and accuracy!";
    } else if (percentage >= 60) {
        message = "👍 Good work! Keep practicing to improve your speed!";
    } else {
        message = "💪 Keep practicing! Focus on accuracy before speed!";
    }
    
    let html = `
        <div class="score-display">${timerCorrectCount}/${timerTotalCount}</div>
        <div class="results-message">${percentage}% Accuracy</div>
        <div class="results-message">${message}</div>
        <div class="results-message">Questions Answered: ${timerTotalCount}</div>
    `;
    
    // Show incorrect answers
    const incorrectAnswers = timerAnsweredQuestions.filter(a => !a.isCorrect);
    if (incorrectAnswers.length > 0) {
        html += '<div class="incorrect-list"><h3>📋 Questions to Review:</h3>';
        
        incorrectAnswers.forEach((answer, idx) => {
            const q = answer.question;
            const correctSequence = q.correctOrder.map(i => q.optionsFurigana[i - 1]);
            const starPosition = 2;
            
            html += '<div class="incorrect-item">';
            html += `<div class="incorrect-number">Question ${idx + 1}</div>`;
            
            if (q.isDialogue) {
                html += `<div class="speaker-line">A: ${parseRuby(q.speakerAFurigana)}</div>`;
            }
            
            html += '<div class="incorrect-answer">';
            html += q.isDialogue ? 'B: ' : '';
            html += parseRuby(q.beforeStarFurigana) + ' ';
            
            correctSequence.forEach((word) => {
                html += `${parseRuby(word)} `;
            });
            
            html += parseRuby(q.afterStarFurigana);
            html += '</div>';
            
            html += `<div class="translation"><strong>📖</strong> ${q.translation}</div>`;
            html += '</div>';
        });
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Quit timer mode
function quitTimerMode() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    // Blur the button
    setTimeout(() => {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    }, 0);
    backToMenu();
}

// Helper function to compare arrays
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// ==================== END TIMER MODE FUNCTIONS ====================

// Study mode
let reviewQuestionIndex = 0;

function showReviewList() {
    showScreen('review-list-screen');
    const container = document.getElementById('review-list-container');
    
    let html = '<div class="question-list">';
    
    PRACTICE_QUESTIONS.forEach((question, index) => {
        const questionNumber = index + 1;
        
        // Create the full answer without stars
        const correctSequence = question.correctOrder.map(i => question.options[i - 1]);
        let fullAnswer = '';
        
        if (question.isDialogue) {
            fullAnswer = `${question.speakerA} / `;
        }
        
        fullAnswer += question.beforeStar + ' ';
        correctSequence.forEach((word) => {
            fullAnswer += word + ' ';
        });
        fullAnswer += question.afterStar;
        
        // Truncate long answers
        let preview = fullAnswer.trim();
        if (preview.length > 80) {
            preview = preview.substring(0, 80) + '...';
        }
        
        html += `
            <div class="review-list-item" onclick="startReviewQuestion(${index})">
                <div class="review-item-number">Question #${questionNumber}</div>
                <div class="review-item-preview">${preview}</div>
                <div class="review-item-arrow">→</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function startReviewQuestion(index) {
    reviewQuestionIndex = index;
    showScreen('review-screen');
    displayReviewQuestion();
}

function displayReviewQuestion() {
    const question = PRACTICE_QUESTIONS[reviewQuestionIndex];
    const container = document.getElementById('review-container');
    
    const questionNumber = reviewQuestionIndex + 1;
    
    document.getElementById('review-counter').textContent = 
        `Question ${questionNumber}/${PRACTICE_QUESTIONS.length}`;
    
    let html = '<div class="question-display">';
    html += `<div style="color: #ff6b35; font-weight: bold; margin-bottom: 10px;">Question #${questionNumber}</div>`;
    
    if (question.isDialogue) {
        html += `<div class="dialogue-label">Dialogue Question:</div>`;
        html += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
        html += `<div class="question-text">B: ${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    } else {
        html += `<div class="question-text">${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    }
    
    html += '</div><h4 style="margin-top: 20px;">Options:</h4><div class="options-grid">';
    
    question.optionsFurigana.forEach((option, index) => {
        html += `<div class="option-card">${index + 1}. ${parseRuby(option)}</div>`;
    });
    
    html += '</div>';
    
    // Show answer immediately in review mode
    const correctSequence = question.correctOrder.map(i => question.optionsFurigana[i - 1]);
    
    html += '<div class="answer-section correct">';
    html += '<div class="answer-header">◯ Correct Answer</div>';
    
    if (question.isDialogue) {
        html += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
    }
    
    html += '<div class="correct-answer">';
    html += question.isDialogue ? 'B: ' : '';
    html += parseRuby(question.beforeStarFurigana) + ' ';
    
    correctSequence.forEach((word) => {
        html += `${parseRuby(word)} `;
    });
    
    html += parseRuby(question.afterStarFurigana);
    html += '</div>';
    
    html += `<div class="translation"><strong>📖 Translation:</strong> ${question.translation}</div>`;
    html += `<div class="explanation"><strong>💡 Grammar Point:</strong> ${question.explanation}</div>`;
    html += `<div style="margin-top: 15px;"><strong>Order:</strong> ${question.correctOrder.join(' → ')}</div>`;
    html += '</div>';
    
    container.innerHTML = html;
    
    // Update navigation buttons
    document.getElementById('prev-review').disabled = reviewQuestionIndex === 0;
    document.getElementById('next-review').textContent = 
        reviewQuestionIndex === PRACTICE_QUESTIONS.length - 1 ? 'Finish' : 'Next →';
}

function backToReviewList() {
    showScreen('review-list-screen');
}

function previousReviewQuestion() {
    if (reviewQuestionIndex > 0) {
        reviewQuestionIndex--;
        displayReviewQuestion();
    }
}

function nextReviewQuestion() {
    if (reviewQuestionIndex < PRACTICE_QUESTIONS.length - 1) {
        reviewQuestionIndex++;
        displayReviewQuestion();
    } else {
        backToReviewList();
    }
}

// Statistics
let selectedStatsQuestions = new Set();

function showStatistics() {
    showScreen('stats-screen');
    const container = document.getElementById('stats-container');
    const stats = loadStats();
    selectedStatsQuestions.clear();
    
    if (Object.keys(stats).length === 0) {
        container.innerHTML = `
            <div class="empty-stats">
                <div class="empty-stats-icon">📊</div>
                <h3>No statistics yet!</h3>
                <p>Start practicing to build your stats.</p>
            </div>
        `;
        document.getElementById('stats-practice-controls').style.display = 'none';
        return;
    }
    
    document.getElementById('stats-practice-controls').style.display = 'block';
    
    // Calculate overall stats
    let totalAttempts = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    
    Object.values(stats).forEach(q => {
        totalAttempts += q.total;
        totalCorrect += q.correct;
        totalIncorrect += q.incorrect;
    });
    
    const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts * 100).toFixed(1) : 0;
    
    let html = `
        <div class="stats-overall">
            <h3>📈 Overall Performance</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${totalAttempts}</span>
                    <span class="stat-label">Total Attempts</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${totalCorrect}</span>
                    <span class="stat-label">Correct ◯</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${totalIncorrect}</span>
                    <span class="stat-label">Incorrect ✕</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${accuracy}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
            </div>
        </div>
    `;
    
    // Sort questions by accuracy (worst first)
    const sortedStats = Object.entries(stats).sort((a, b) => {
        const accA = a[1].correct / a[1].total;
        const accB = b[1].correct / b[1].total;
        return accA - accB;
    });
    
    html += '<div class="stats-list"><h3>📝 Questions Needing Practice</h3>';
    
    sortedStats.forEach(([key, data]) => {
        const acc = (data.correct / data.total * 100).toFixed(1);
        const classType = acc < 50 ? 'weak' : acc < 80 ? 'medium' : 'strong';
        const icon = acc < 50 ? '✕' : acc < 80 ? '⚠️' : '◯';
        const displayText = data.fullAnswer || key;
        const questionNum = data.questionNumber || 0;
        const questionNumDisplay = questionNum ? `<span style="color: #ff6b35; font-weight: bold;">Question #${questionNum}:</span> ` : '';
        
        html += `
            <div class="stat-question ${classType} stat-question-selectable" data-question-num="${questionNum}" data-accuracy="${acc}" onclick="toggleStatQuestion(${questionNum})">
                <input type="checkbox" class="stat-checkbox" id="stat-check-${questionNum}" onclick="event.stopPropagation();">
                <div class="stat-question-content">
                    <div class="stat-question-text">${questionNumDisplay}${icon} ${displayText}</div>
                    <div style="color: #666; margin: 5px 0;">${data.translation}</div>
                    <div class="stat-details">
                        <span>Attempts: ${data.total}</span>
                        <span>Correct: ${data.correct}</span>
                        <span>Incorrect: ${data.incorrect}</span>
                        <span>Accuracy: ${acc}%</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    updateStatsPracticeButton();
}

// Clear all statistics
function clearStatistics() {
    if (confirm('Are you sure you want to clear all statistics? This action cannot be undone.')) {
        localStorage.removeItem(STATS_KEY);
        showStatistics(); // Refresh the display
    }
}

// Toggle question selection in statistics
function toggleStatQuestion(questionNum) {
    if (!questionNum) return;
    
    const checkbox = document.getElementById(`stat-check-${questionNum}`);
    if (!checkbox) return;
    
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        selectedStatsQuestions.add(questionNum);
    } else {
        selectedStatsQuestions.delete(questionNum);
    }
    
    updateStatsPracticeButton();
}

// Select questions with accuracy < 60%
function selectLowAccuracyQuestions() {
    selectedStatsQuestions.clear();
    
    const questionCards = document.querySelectorAll('.stat-question-selectable');
    questionCards.forEach(card => {
        const accuracy = parseFloat(card.dataset.accuracy);
        const questionNum = parseInt(card.dataset.questionNum);
        const checkbox = document.getElementById(`stat-check-${questionNum}`);
        
        if (accuracy < 60 && checkbox) {
            checkbox.checked = true;
            selectedStatsQuestions.add(questionNum);
        } else if (checkbox) {
            checkbox.checked = false;
        }
    });
    
    updateStatsPracticeButton();
}

// Update practice button text
function updateStatsPracticeButton() {
    const button = document.getElementById('start-stats-practice');
    const clearButton = document.getElementById('clear-stats-selection');
    const count = selectedStatsQuestions.size;
    
    if (count === 0) {
        button.style.display = 'none';
        clearButton.style.display = 'none';
        button.disabled = true;
    } else {
        button.style.display = 'block';
        clearButton.style.display = 'block';
        button.textContent = 'Practice Selected';
        button.disabled = false;
    }
}

// Start practice with selected questions
function startStatsPractice() {
    if (selectedStatsQuestions.size === 0) {
        alert('Please select at least one question to practice');
        return;
    }
    
    // Get selected questions from PRACTICE_QUESTIONS
    const questionNumbers = Array.from(selectedStatsQuestions).sort((a, b) => a - b);
    practiceQuestions = questionNumbers.map(num => PRACTICE_QUESTIONS[num - 1]).filter(q => q);
    
    if (practiceQuestions.length === 0) {
        alert('Error loading questions');
        return;
    }
    
    // Initialize practice mode
    currentQuestionIndex = 0;
    score = 0;
    selectedOrder = [];
    practiceAnsweredQuestions = [];
    
    showScreen('practice-screen');
    displayPracticeQuestion();
}

// ==================== DEBUG MODE FUNCTIONS ====================

let debugQuestionNumber = 0;
let debugSelectedOrder = [];

// Show debug mode screen
function showDebugMode() {
    showScreen('debug-screen');
}

// Start debug question
function startDebugQuestion() {
    const questionNum = parseInt(document.getElementById('debug-question-input').value);
    
    if (!questionNum || questionNum < 1 || questionNum > PRACTICE_QUESTIONS.length) {
        alert(`Please enter a question number between 1 and ${PRACTICE_QUESTIONS.length}`);
        return;
    }
    
    debugQuestionNumber = questionNum;
    debugSelectedOrder = [];
    
    showScreen('debug-question-screen');
    displayDebugQuestion();
}

// Display debug question
function displayDebugQuestion() {
    const question = PRACTICE_QUESTIONS[debugQuestionNumber - 1];
    const container = document.getElementById('debug-question-container');
    
    // Update counter
    document.getElementById('debug-counter').textContent = `Question #${debugQuestionNumber}`;
    
    // Reset selected order
    debugSelectedOrder = [];
    
    // Build question HTML
    let html = '<div class="question-display">';
    
    if (question.isDialogue) {
        html += `<div class="dialogue-label">Complete Speaker B's response:</div>`;
        html += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
        html += `<div class="question-text">B: ${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    } else {
        html += `<div class="dialogue-label">Arrange the words in the correct order:</div>`;
        html += `<div class="question-text">${parseRuby(question.beforeStarFurigana)} ___ ___ ___ ___ ${parseRuby(question.afterStarFurigana)}</div>`;
    }
    
    html += '</div>';
    html += '<div class="options-grid">';
    
    question.optionsFurigana.forEach((option, index) => {
        html += `<div class="option-card" onclick="selectDebugOption(${index + 1})" id="debug-option-${index + 1}">
            ${parseRuby(option)}
            <span class="order-number hidden" id="debug-order-${index + 1}"></span>
        </div>`;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Show/hide buttons and re-enable submit button
    const submitBtn = document.getElementById('debug-submit-answer');
    submitBtn.classList.remove('hidden');
    submitBtn.disabled = false;
    document.getElementById('debug-next-question').classList.add('hidden');
}

// Select an option in debug mode
function selectDebugOption(optionNum) {
    const optionCard = document.getElementById(`debug-option-${optionNum}`);
    const orderSpan = document.getElementById(`debug-order-${optionNum}`);
    
    // If already selected, deselect
    const currentIndex = debugSelectedOrder.indexOf(optionNum);
    if (currentIndex !== -1) {
        debugSelectedOrder.splice(currentIndex, 1);
        optionCard.classList.remove('selected');
        orderSpan.classList.add('hidden');
        
        // Update remaining order numbers
        debugSelectedOrder.forEach((num, idx) => {
            document.getElementById(`debug-order-${num}`).textContent = idx + 1;
        });
    } else if (debugSelectedOrder.length < 4) {
        // Add to selection
        debugSelectedOrder.push(optionNum);
        optionCard.classList.add('selected');
        orderSpan.textContent = debugSelectedOrder.length;
        orderSpan.classList.remove('hidden');
    }
}

// Submit debug answer
function submitDebugAnswer() {
    if (debugSelectedOrder.length !== 4) {
        alert('Please select all 4 options in order');
        return;
    }
    
    // Disable buttons to prevent multiple submissions
    const submitBtn = document.getElementById('debug-submit-answer');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    
    const question = PRACTICE_QUESTIONS[debugQuestionNumber - 1];
    const isCorrect = JSON.stringify(debugSelectedOrder) === JSON.stringify(question.correctOrder);
    
    // Show answer
    showDebugAnswer(question, isCorrect);
    
    // Hide submit, show next
    submitBtn.classList.add('hidden');
    document.getElementById('debug-next-question').classList.remove('hidden');
}

// Show answer in debug mode
function showDebugAnswer(question, isCorrect) {
    const container = document.getElementById('debug-question-container');
    const correctSequence = question.correctOrder.map(i => question.optionsFurigana[i - 1]);
    
    let answerHtml = `<div class="answer-section ${isCorrect ? 'correct' : 'incorrect'}">`;
    answerHtml += `<div class="answer-header">${isCorrect ? '◯ CORRECT!' : '✕ Not quite right'}</div>`;
    
    if (question.isDialogue) {
        answerHtml += `<div class="speaker-line">A: ${parseRuby(question.speakerAFurigana)}</div>`;
    }
    
    answerHtml += '<div class="correct-answer">';
    answerHtml += question.isDialogue ? 'B: ' : '';
    answerHtml += parseRuby(question.beforeStarFurigana) + ' ';
    
    if (!isCorrect) {
        // Show user's incorrect answer with wrong parts highlighted
        const userSequence = debugSelectedOrder.map(i => question.optionsFurigana[i - 1]);
        userSequence.forEach((word, idx) => {
            if (debugSelectedOrder[idx] !== question.correctOrder[idx]) {
                answerHtml += `<span class="incorrect-word">${parseRuby(word)}</span> `;
            } else {
                answerHtml += `${parseRuby(word)} `;
            }
        });
        answerHtml += parseRuby(question.afterStarFurigana);
        answerHtml += '</div>';
        answerHtml += '<div style="margin-top: 15px; font-weight: bold; color: #28a745;">Correct order:</div>';
        answerHtml += '<div class="correct-answer">';
        answerHtml += question.isDialogue ? 'B: ' : '';
        answerHtml += parseRuby(question.beforeStarFurigana) + ' ';
    }
    
    correctSequence.forEach((word) => {
        answerHtml += `${parseRuby(word)} `;
    });
    
    answerHtml += parseRuby(question.afterStarFurigana);
    answerHtml += '</div>';
    
    answerHtml += `<div class="translation"><strong>📖 Translation:</strong> ${question.translation}</div>`;
    answerHtml += `<div class="explanation"><strong>💡 Grammar Point:</strong> ${question.explanation}</div>`;
    answerHtml += '</div>';
    
    container.innerHTML += answerHtml;
}

// Skip debug question
function skipDebugQuestion() {
    // Disable submit button to prevent multiple skips
    const submitBtn = document.getElementById('debug-submit-answer');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    
    const question = PRACTICE_QUESTIONS[debugQuestionNumber - 1];
    showDebugAnswer(question, false);
    submitBtn.classList.add('hidden');
    document.getElementById('debug-next-question').classList.remove('hidden');
}

// Return to debug menu
function returnToDebugMenu() {
    showScreen('debug-screen');
}

// ==================== END DEBUG MODE FUNCTIONS ====================

// ==================== CONFETTI FUNCTIONS ====================

function triggerFallConfetti() {
    const duration = 3000; // 3 seconds
    const animationEnd = Date.now() + duration;
    const colors = ['#dc143c', '#8b4513', '#ffa500', '#ff8c00', '#cd853f', '#ff6347'];
    
    const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            clearInterval(confettiInterval);
            return;
        }
        
        // Create multiple confetti pieces per interval
        for (let i = 0; i < 3; i++) {
            createConfettiPiece(colors);
        }
    }, 50);
}

function createConfettiPiece(colors) {
    const confetti = document.createElement('div');
    const rand = Math.random();
    const isLeaf = rand > 0.75; // 25% leaves
    const isCircle = rand > 0.60 && rand <= 0.75; // 15% circles
    // Remaining 60% are rectangles
    
    if (isLeaf) {
        confetti.className = 'confetti-leaf';
    } else if (isCircle) {
        confetti.className = 'confetti-circle';
    } else {
        confetti.className = 'confetti-piece';
    }
    
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    
    if (isLeaf) {
        // Leaf shape using emoji
        confetti.innerHTML = '🍂';
        confetti.style.fontSize = (Math.random() * 15 + 20) + 'px';
    }
    
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
        confetti.remove();
    }, 4000);
}

// ==================== END CONFETTI FUNCTIONS ====================

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showScreen('main-menu');
    
    // Add event listener to blur all buttons after click
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            setTimeout(() => {
                if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
                    document.activeElement.blur();
                }
            }, 100);
        }
    });
});
