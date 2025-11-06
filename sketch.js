let quizTable;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'start'; // 'start', 'quiz', 'result'
let selectedAnswer = null;
let answerChecked = false;
let feedback = '';
let feedbackColor;

let cursorParticles = [];
let selectionParticles = [];

let optionBoxes = [];
let restartButton;

// 在 preload 函數中載入 CSV 檔案
function preload() {
  quizTable = loadTable('quiz.csv', 'csv', 'header');
}

function setup() {
  createCanvas(800, 600);
  parseQuestions();
  setupOptionBoxes();
  
  // 創建重新開始按鈕，但先隱藏
  restartButton = createButton('重新開始');
  restartButton.position(width / 2 + 400 - restartButton.width, height / 2 + 150);
  restartButton.mousePressed(restartQuiz);
  restartButton.hide();
}

function draw() {
  background(240, 245, 255);
  drawCursorEffect();

  switch (gameState) {
    case 'start':
      drawStartScreen();
      break;
    case 'quiz':
      drawQuizScreen();
      drawSelectionEffect();
      break;
    case 'result':
      drawResultScreen();
      break;
  }
}

function mousePressed() {
  if (gameState === 'start') {
    gameState = 'quiz';
  } else if (gameState === 'quiz' && !answerChecked) {
    for (let i = 0; i < optionBoxes.length; i++) {
      if (optionBoxes[i].isMouseOver()) {
        selectedAnswer = optionBoxes[i].optionKey;
        checkAnswer();
        createSelectionEffect(mouseX, mouseY);
        break;
      }
    }
  }
}

function parseQuestions() {
  for (let row of quizTable.getRows()) {
    questions.push({
      question: row.getString('question'),
      options: {
        A: row.getString('optionA'),
        B: row.getString('optionB'),
        C: row.getString('optionC'),
        D: row.getString('optionD'),
      },
      correct: row.getString('correct')
    });
  }
}

function setupOptionBoxes() {
    const boxWidth = 600;
    const boxHeight = 50;
    const startY = height / 2 - 100;
    const spacing = 70;
    const keys = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < keys.length; i++) {
        optionBoxes.push(new OptionBox(width / 2 - boxWidth / 2, startY + i * spacing, boxWidth, boxHeight, keys[i]));
    }
}

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(50, 50, 150);
  text('p5.js 測驗系統', width / 2, height / 2 - 50);
  textSize(24);
  fill(100);
  text('點擊畫面任何地方開始', width / 2, height / 2 + 20);
}

function drawQuizScreen() {
  if (currentQuestionIndex < questions.length) {
    let q = questions[currentQuestionIndex];
    textAlign(LEFT, CENTER);
    textSize(28);
    fill(0);
    text(`Q${currentQuestionIndex + 1}: ${q.question}`, 100, 80, 600, 80);

    for (let i = 0; i < optionBoxes.length; i++) {
        const key = optionBoxes[i].optionKey;
        optionBoxes[i].display(q.options[key]);
    }

    if (answerChecked) {
      textSize(32);
      fill(feedbackColor);
      textAlign(CENTER, CENTER);
      text(feedback, width / 2, height - 50);
    }
  }
}

function checkAnswer() {
  answerChecked = true;
  let correct = questions[currentQuestionIndex].correct;
  if (selectedAnswer === correct) {
    score++;
    feedback = '答對了！';
    feedbackColor = color(0, 150, 0);
  } else {
    feedback = `答錯了，正確答案是 ${correct}`;
    feedbackColor = color(200, 0, 0);
  }

  setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
  currentQuestionIndex++;
  selectedAnswer = null;
  answerChecked = false;
  feedback = '';
  if (currentQuestionIndex >= questions.length) {
    gameState = 'result';
    restartButton.show();
  }
}

function drawResultScreen() {
  let percentage = (score / questions.length) * 100;
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(0);
  text(`測驗結束！你的分數是: ${score} / ${questions.length}`, width / 2, height / 2 - 100);
  text(`得分率: ${percentage.toFixed(1)}%`, width / 2, height / 2 - 50);

  if (percentage >= 80) {
    praiseAnimation();
  } else {
    encouragementAnimation();
  }
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    gameState = 'quiz';
    selectedAnswer = null;
    answerChecked = false;
    feedback = '';
    restartButton.hide();
}

class OptionBox {
    constructor(x, y, w, h, optionKey) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.optionKey = optionKey;
    }

    isMouseOver() {
        return mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h;
    }

    display(optionText) {
        push();
        stroke(150);
        strokeWeight(2);
        if (this.isMouseOver() && !answerChecked) {
            fill(220, 230, 255);
        } else {
            fill(255);
        }

        if (answerChecked) {
            let correct = questions[currentQuestionIndex].correct;
            if (this.optionKey === correct) {
                fill(200, 255, 200); // Green for correct
            } else if (this.optionKey === selectedAnswer) {
                fill(255, 200, 200); // Red for wrong selection
            }
        }

        rect(this.x, this.y, this.w, this.h, 10);
        
        fill(0);
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(18);
        text(`${this.optionKey}: ${optionText}`, this.x + 20, this.y + this.h / 2);
        pop();
    }
}

// --- Animations and Effects ---

function praiseAnimation() {
  for (let i = 0; i < 5; i++) {
    cursorParticles.push(new Particle(random(width), random(height / 2, height), color(random(255), random(255), random(255)), 10, true));
  }
  drawParticles(cursorParticles, true);
}

function encouragementAnimation() {
  for (let i = 0; i < 2; i++) {
    cursorParticles.push(new Particle(random(width), 0, color(100, 150, 255, 150), 5, false, createVector(0, random(1, 3))));
  }
  drawParticles(cursorParticles, false);
}

function drawCursorEffect() {
  cursorParticles.push(new Particle(mouseX, mouseY, color(255, 150, 0, 100), 5));
  drawParticles(cursorParticles, false);
}

function createSelectionEffect(x, y) {
  for (let i = 0; i < 30; i++) {
    selectionParticles.push(new Particle(x, y, color(255, 220, 0), 7, true));
  }
}

function drawSelectionEffect() {
  drawParticles(selectionParticles, true);
}

function drawParticles(particles, isExplosion) {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(isExplosion);
    particles[i].display();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }
}

class Particle {
  constructor(x, y, col, size, isExplosion = false, vel = null) {
    this.pos = createVector(x, y);
    if (isExplosion) {
      this.vel = p5.Vector.random2D().mult(random(1, 6));
    } else {
      this.vel = vel || createVector(0, 0);
    }
    this.col = col;
    this.size = random(size * 0.5, size * 1.5);
    this.lifespan = 255;
  }

  update(isExplosion) {
    this.pos.add(this.vel);
    if (isExplosion) {
      this.vel.mult(0.95);
    }
    this.lifespan -= 5;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}
