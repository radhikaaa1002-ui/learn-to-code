const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const courseData = {
  html: {
    title: "HTML Essentials",
    intro: "Learn how a webpage is structured.",
    lessons: [
      {title:"What is HTML?", body:"HTML stands for HyperText Markup Language. It gives a webpage its structure: headings, paragraphs, links, images, and more.", code:"<h1>Welcome!</h1>\n<p>This is my first webpage.</p>", tip:"Try changing the heading text in the example. HTML describes content; CSS controls how it looks."},
      {title:"Elements and attributes", body:"Most HTML elements use an opening tag and a closing tag. Attributes add extra information to an element.", code:'<a href="https://example.com">Visit a website</a>\n<img src="photo.jpg" alt="A description">', tip:"The href attribute tells a link where to go. The alt attribute describes an image for accessibility."},
      {title:"Build a simple page", body:"A basic HTML document includes a doctype, an html element, a head for page information, and a body for visible content.", code:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello!</h1>\n  <p>I am learning HTML.</p>\n</body>\n</html>', tip:"Save your document as index.html and open it in a browser."}
    ]
  },
  css: {
    title:"CSS Foundations", intro:"Make webpages attractive and responsive.",
    lessons:[
      {title:"What is CSS?",body:"CSS stands for Cascading Style Sheets. It controls colors, fonts, spacing, borders, and page layout.",code:"h1 {\n  color: royalblue;\n  font-size: 32px;\n}",tip:"A CSS rule has a selector and declarations inside curly braces."},
      {title:"Selectors and spacing",body:"A selector chooses which elements to style. Use a dot for a class selector and a hash for an ID selector.",code:".card {\n  padding: 20px;\n  margin: 12px;\n  border-radius: 10px;\n}\n\n#main-title {\n  color: teal;\n}",tip:"Padding is space inside an element; margin is space outside it."},
      {title:"Responsive layouts",body:"Responsive design helps a page work on phones, tablets, and computers. CSS Grid and media queries are useful tools.",code:".grid {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 16px;\n}\n\n@media (max-width: 600px) {\n  .grid { grid-template-columns: 1fr; }\n}",tip:"Test your design at different browser widths."}
    ]
  },
  javascript: {
    title:"JavaScript Basics", intro:"Add actions and logic to a webpage.",
    lessons:[
      {title:"Variables",body:"Variables store values. Use const when you do not need to reassign a variable and let when its value will change.",code:'const learner = "Alex";\nlet score = 0;\nscore = score + 1;\nconsole.log(learner, score);',tip:"Text values use quotes. Numbers do not need quotes."},
      {title:"Functions",body:"A function is a reusable block of code. You can pass values into it and return a result.",code:"function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(2, 3)); // 5",tip:"Functions help you avoid repeating the same code."},
      {title:"Respond to a click",body:"JavaScript can listen for user actions and update the page without reloading it.",code:'const button = document.querySelector("#myButton");\nbutton.addEventListener("click", () => {\n  alert("Great job!");\n});',tip:"The button needs id=\"myButton\" in your HTML for this example to work."}
    ]
  },
  python: {
    title:"Python Starter", intro:"Start programming with simple, readable code.",
    lessons:[
      {title:"Your first program",body:"Python is a general-purpose programming language. The print() function displays information.",code:'print("Hello, world!")\nprint("I am learning Python.")',tip:"Python is case-sensitive. Write print in lowercase."},
      {title:"Variables and values",body:"A variable gives a name to a value. Python can work with text, integers, decimal numbers, and Boolean values.",code:'name = "Sam"\nage = 19\nis_learning = True\nprint(name, age, is_learning)',tip:"Use descriptive names to make programs easier to understand."},
      {title:"Conditions",body:"An if statement runs code when a condition is true. An else block handles the alternative case.",code:"score = 75\nif score >= 50:\n    print(\"Pass\")\nelse:\n    print(\"Try again\")",tip:"Python uses indentation to show which statements belong to a block."}
    ]
  }
};

const quizQuestions = [
  {q:"Which language gives a webpage its structure?", options:["CSS","HTML","Python","SQL"], answer:1, explain:"HTML defines the structure and content of a webpage."},
  {q:"Which language is mainly used to style a webpage?", options:["CSS","Java","HTML","C"], answer:0, explain:"CSS controls visual styling, including colors, spacing, and layout."},
  {q:"Which JavaScript keyword declares a variable that can be reassigned?", options:["fixed","let","define","style"], answer:1, explain:"Use let when you need to reassign a variable."},
  {q:"Which Python function displays output?", options:["show()","echo()","print()","writeLine()"], answer:2, explain:"Python's print() function displays output."},
  {q:"What does CSS stand for?", options:["Computer Style Syntax","Cascading Style Sheets","Creative System Setup","Code Styling Source"], answer:1, explain:"CSS stands for Cascading Style Sheets."}
];

const STORAGE_KEY = "codestart-progress-v1";
let state = loadState();
let activeCourse = "html";
let activeLesson = 0;
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;
let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      completed: saved.completed && typeof saved.completed === "object" ? saved.completed : {},
      bestScore: Number.isFinite(saved.bestScore) ? saved.bestScore : null,
      dark: Boolean(saved.dark)
    };
  } catch {
    return {completed:{}, bestScore:null, dark:false};
  }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { showToast("Browser storage is unavailable; progress may not be saved."); }
}
function isCompleted(course, lesson) {
  return Boolean(state.completed[course]?.includes(lesson));
}
function courseCompletedCount(course) {
  return courseData[course].lessons.filter((_, i) => isCompleted(course, i)).length;
}
function renderProgress() {
  let total = 0;
  Object.keys(courseData).forEach(course => {
    const count = courseCompletedCount(course);
    total += count;
    const bar = $(`#bar-${course}`);
    const label = $(`#label-${course}`);
    if (bar) bar.style.width = `${count / courseData[course].lessons.length * 100}%`;
    if (label) label.textContent = `${count} of ${courseData[course].lessons.length} lessons`;
  });
  $("#completedCount").textContent = total;
  $("#bestScore").textContent = state.bestScore === null ? "—" : `${state.bestScore}%`;
  $$(".lesson-list button").forEach(button => {
    const course = button.dataset.course;
    const lesson = Number(button.dataset.lesson);
    const mark = button.querySelector(".lesson-status");
    if (mark) mark.textContent = isCompleted(course, lesson) ? "✓ Completed" : "Not completed";
  });
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function openCourse(course) {
  if (!courseData[course]) return;
  activeCourse = course;
  activeLesson = 0;
  const area = $("#lessonArea");
  area.hidden = false;
  $("#lessonTitle").textContent = courseData[course].title;
  $("#lessonIntro").textContent = courseData[course].intro;
  renderLessonList();
  renderLesson();
  area.scrollIntoView({behavior:"smooth", block:"start"});
}
function renderLessonList() {
  const list = $("#lessonList");
  list.replaceChildren();
  courseData[activeCourse].lessons.forEach((lesson, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.course = activeCourse;
    button.dataset.lesson = String(index);
    button.className = index === activeLesson ? "active" : "";
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${lesson.title}`;
    const status = document.createElement("small");
    status.className = "lesson-status";
    status.textContent = isCompleted(activeCourse, index) ? "✓ Completed" : "Not completed";
    button.append(title, status);
    button.addEventListener("click", () => { activeLesson = index; renderLessonList(); renderLesson(); });
    list.append(button);
  });
}
function renderLesson() {
  const lesson = courseData[activeCourse].lessons[activeLesson];
  $("#lessonNumber").textContent = `LESSON ${activeLesson + 1} OF ${courseData[activeCourse].lessons.length}`;
  $("#currentLessonTitle").textContent = lesson.title;
  const body = $("#lessonBody");
  body.replaceChildren();
  const paragraph = document.createElement("p");
  paragraph.textContent = lesson.body;
  const code = document.createElement("pre");
  code.textContent = lesson.code;
  const tip = document.createElement("p");
  tip.textContent = `Tip: ${lesson.tip}`;
  body.append(paragraph, code, tip);
  $("#prevLesson").disabled = activeLesson === 0;
  $("#nextLesson").disabled = activeLesson === courseData[activeCourse].lessons.length - 1;
  $("#completeLesson").textContent = isCompleted(activeCourse, activeLesson) ? "Completed ✓" : "Mark complete ✓";
  $("#lessonMessage").textContent = isCompleted(activeCourse, activeLesson) ? "Nice work — this lesson is complete." : "";
  renderProgress();
}
function completeLesson() {
  const completed = state.completed[activeCourse] || [];
  if (!completed.includes(activeLesson)) {
    completed.push(activeLesson);
    state.completed[activeCourse] = completed;
    saveState();
    showToast("Lesson marked complete!");
  } else {
    showToast("You have already completed this lesson.");
  }
  renderLessonList();
  renderLesson();
}
function renderQuestion() {
  const item = quizQuestions[quizIndex];
  quizAnswered = false;
  $("#questionCounter").textContent = `QUESTION ${quizIndex + 1} OF ${quizQuestions.length}`;
  $("#scorePreview").textContent = `Score: ${quizScore}`;
  $("#quizProgressBar").style.width = `${quizIndex / quizQuestions.length * 100}%`;
  $("#questionText").textContent = item.q;
  $("#quizFeedback").textContent = "";
  $("#nextQuestion").disabled = true;
  $("#nextQuestion").textContent = quizIndex === quizQuestions.length - 1 ? "See results →" : "Next question →";
  const options = $("#answerOptions");
  options.replaceChildren();
  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => selectAnswer(index));
    options.append(button);
  });
}
function selectAnswer(selected) {
  if (quizAnswered) return;
  quizAnswered = true;
  const item = quizQuestions[quizIndex];
  const buttons = $$(".answer-option");
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add("correct");
    if (index === selected && selected !== item.answer) button.classList.add("incorrect");
  });
  if (selected === item.answer) {
    quizScore++;
    $("#quizFeedback").textContent = `Correct! ${item.explain}`;
  } else {
    $("#quizFeedback").textContent = `Not quite. ${item.explain}`;
  }
  $("#scorePreview").textContent = `Score: ${quizScore}`;
  $("#nextQuestion").disabled = false;
}
function nextQuestion() {
  if (!quizAnswered) return;
  if (quizIndex < quizQuestions.length - 1) {
    quizIndex++;
    renderQuestion();
  } else {
    const percent = Math.round(quizScore / quizQuestions.length * 100);
    if (state.bestScore === null || percent > state.bestScore) state.bestScore = percent;
    saveState();
    $("#questionCounter").textContent = "QUIZ COMPLETE";
    $("#quizProgressBar").style.width = "100%";
    $("#questionText").textContent = `You scored ${quizScore} out of ${quizQuestions.length} (${percent}%).`;
    $("#answerOptions").replaceChildren();
    $("#quizFeedback").textContent = percent >= 80 ? "Excellent work! Keep building your skills." : "Good practice! Review the lessons and try again.";
    $("#nextQuestion").disabled = true;
    $("#nextQuestion").textContent = "Quiz complete";
    $("#scorePreview").textContent = `Score: ${quizScore}`;
    renderProgress();
  }
}
function restartQuiz() { quizIndex = 0; quizScore = 0; renderQuestion(); }
function applyTheme() {
  document.body.classList.toggle("dark", state.dark);
  $("#themeToggle").textContent = state.dark ? "☀" : "☾";
  $("#themeToggle").setAttribute("aria-label", state.dark ? "Switch to light mode" : "Switch to dark mode");
}
$("#courseSearch").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  let shown = 0;
  $$(".course-card").forEach(card => {
    const match = `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query);
    card.hidden = !match;
    if (match) shown++;
  });
  $("#noCourses").hidden = shown !== 0;
});
$$(".open-course").forEach(button => button.addEventListener("click", () => openCourse(button.dataset.open)));
$("#closeLesson").addEventListener("click", () => { $("#lessonArea").hidden = true; $("#courses").scrollIntoView({behavior:"smooth"}); });
$("#completeLesson").addEventListener("click", completeLesson);
$("#prevLesson").addEventListener("click", () => { if (activeLesson > 0) { activeLesson--; renderLessonList(); renderLesson(); } });
$("#nextLesson").addEventListener("click", () => { if (activeLesson < courseData[activeCourse].lessons.length - 1) { activeLesson++; renderLessonList(); renderLesson(); } });
$("#nextQuestion").addEventListener("click", nextQuestion);
$("#restartQuiz").addEventListener("click", restartQuiz);
$("#themeToggle").addEventListener("click", () => { state.dark = !state.dark; saveState(); applyTheme(); });
$("#menuToggle").addEventListener("click", () => {
  const nav = $("#mainNav");
  const open = nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
  $("#menuToggle").setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
$$(".main-nav a").forEach(link => link.addEventListener("click", () => {
  $("#mainNav").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}));
$("#resetProgress").addEventListener("click", () => {
  if (!confirm("Reset all completed lessons and your best quiz score on this browser?")) return;
  state.completed = {};
  state.bestScore = null;
  saveState();
  renderProgress();
  if (!$("#lessonArea").hidden) { renderLessonList(); renderLesson(); }
  showToast("Your learning progress has been reset.");
});
applyTheme();
renderQuestion();
renderProgress();
