// ---------- Data ----------

const QUOTES = [
  "Am I testing my code, or is it testing me?",
  "Your code doesn't hate you. It's just very, very literal.",
  "Every 'undefined is not a function' brings you closer to 'it works'.",
  "You're not stuck. You're just doing research on all the ways NOT to do it.",
  "Segfaults build character. So does the fifth cup of coffee.",
  "The compiler isn't judging you. It's just extremely picky.",
  "One more test case. You can sleep after the green checkmark.",
  "Recursion is scary until it isn't. You've already survived worse (CMPT 125).",
  "Big-O won't remember this all-nighter. But future-you will thank present-you.",
  "You debugged for 3 hours to fix a missing semicolon. That's not failure, that's dedication.",
  "Nobody writes perfect code on the first try. Not even your TA.",
  "It compiled! Never mind that it does nothing correctly. Progress is progress.",
  "You are one Stack Overflow tab away from greatness.",
  "The assignment is due in 4 hours and you have 2 working test cases. This is basically a thriller movie.",
  "Your rubber duck believes in you, even when your linked list doesn't.",
  "Every CMPT student has cried over a semicolon at least once. You're in good company.",
  "This bug is temporary. Your growth as a developer is not.",
  "You don't need to understand it all today. You need to understand a little more than yesterday.",
  "Ctrl+Z is not just an undo button, it's a philosophy.",
  "Somewhere, a professor is proud of how long you've been staring at this terminal.",
];

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are 10 types of people in the world: those who understand binary and those who don't.",
  "A CMPT student's favorite sorting algorithm: hopeful bubble sort at 2am.",
  "Why did the recursive function go to therapy? It had too many unresolved base cases.",
  "!false — it's funny because it's true.",
  "Why do Java developers wear glasses? Because they don't C#.",
  "I told my code a joke. No reaction. Turns out it doesn't have a sense of humor(). ",
  "Why was the array always calm? It knew its index.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "My code doesn't have bugs. It has undocumented features.",
  "Why did the student submit a linked list as their resume? To show off their strong references.",
  "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
  "Why do CMPT students never get lost? They always know their stack trace.",
  "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 127 little bugs in the code.",
  "Why was the function feeling lonely? It didn't get called.",
  "I finally understand recursion. To understand recursion, see 'I finally understand recursion.'",
  "Debugging: being the detective in a crime movie where you are also the murderer.",
  "Why did the developer go broke? Because they used up all their cache.",
  "What's a CMPT student's favorite dance move? The Infinite Loop.",
  "Optimism is: 'This assignment will only take an hour.'",
];

const CONCEPTS = [
  {
    tag: "Data Structures",
    title: "Big-O Notation",
    hint: "How fast is 'fast'?",
    body: "Big-O describes how an algorithm's runtime or memory use grows as input size grows. O(1) is constant, O(log n) barely notices bigger input, O(n) scales linearly, O(n²) starts sweating, and O(2ⁿ) should be avoided unless you enjoy waiting.",
    joke: "O(n²) walked into a bar. It took forever to get served — the bartender had to check every combination of drinks.",
  },
  {
    tag: "Data Structures",
    title: "Recursion",
    hint: "A function that calls itself.",
    body: "A function solves a problem by calling itself on a smaller version of that problem, until it hits a base case that stops the calls. Every recursive call needs a base case, or you get a stack overflow (and a very expensive nap for your CPU).",
    joke: "To understand recursion, you must first understand recursion.",
  },
  {
    tag: "Data Structures",
    title: "Linked Lists",
    hint: "Nodes holding hands.",
    body: "A sequence of nodes where each node points to the next. Great for fast insertion/removal, bad for random access — you have to walk the chain one node at a time to get anywhere.",
    joke: "Why did the linked list break up with the array? It wanted a relationship with commitment issues resolved one node at a time.",
  },
  {
    tag: "Data Structures",
    title: "Stacks & Queues",
    hint: "LIFO vs FIFO.",
    body: "A stack is Last-In-First-Out — think a stack of plates, or your browser's back button. A queue is First-In-First-Out — think a line at Tim Hortons on campus. Both are used everywhere: call stacks, undo history, task scheduling.",
    joke: "I tried to explain queues to my friend, but they had to wait their turn.",
  },
  {
    tag: "Data Structures",
    title: "Binary Trees",
    hint: "Branches, not roots.",
    body: "A hierarchical structure where each node has at most two children. Binary Search Trees keep smaller values left and larger values right, giving O(log n) search — as long as the tree stays balanced and doesn't turn into a sad linked list.",
    joke: "Why do binary trees make bad secret keepers? They always have two sides to every story.",
  },
  {
    tag: "Data Structures",
    title: "Hash Tables",
    hint: "Instant lookup, mostly.",
    body: "Hash tables map keys to values using a hash function, giving average O(1) lookup, insert, and delete. Collisions happen when two keys hash to the same slot — handled with chaining or open addressing.",
    joke: "I have a great hash table joke, but there was a collision and now two other jokes live in the same slot.",
  },
  {
    tag: "Algorithms",
    title: "Sorting Algorithms",
    hint: "Bubble, merge, quick — pick one.",
    body: "Bubble sort is simple but slow (O(n²)). Merge sort divides and conquers reliably at O(n log n). Quicksort is usually fast in practice but can degrade on bad pivots. Know the trade-offs, not just the code.",
    joke: "Why did bubble sort get eliminated early? It kept comparing itself to everyone next to it.",
  },
  {
    tag: "Algorithms",
    title: "Dynamic Programming",
    hint: "Don't repeat yourself. Ever.",
    body: "DP solves problems by breaking them into overlapping subproblems and storing the results (memoization or tabulation) so you never recompute the same thing twice. If you're recalculating fib(30) a million times, DP is your friend.",
    joke: "Dynamic programming: because doing the same work twice is a rookie mistake, and doing it a million times is a personality trait.",
  },
  {
    tag: "Algorithms",
    title: "Graph Traversal",
    hint: "BFS vs DFS.",
    body: "BFS explores level by level using a queue — great for shortest paths on unweighted graphs. DFS dives as deep as possible using a stack (or recursion) before backtracking — great for exploring all paths or detecting cycles.",
    joke: "BFS and DFS walked into a maze. BFS checked every door on the floor first. DFS just picked one and committed, no regrets.",
  },
  {
    tag: "Systems",
    title: "Pointers & Memory",
    hint: "Where things actually live.",
    body: "A pointer stores a memory address rather than a value directly. Dereferencing a null or dangling pointer is the classic source of segfaults. malloc/free (or new/delete) hand-manage memory — forget to free it and you've got a leak.",
    joke: "A null pointer walks into a bar. The bar doesn't exist. Segmentation fault.",
  },
  {
    tag: "Systems",
    title: "Processes & Threads",
    hint: "Doing many things (sort of) at once.",
    body: "A process has its own memory space; threads within a process share memory but run somewhat independently. Concurrency introduces race conditions when threads touch shared data without synchronization — locks and mutexes keep the peace.",
    joke: "Two threads walk into a bar. Thread A orders first, thread B orders first, thread A orders first, thread B or—",
  },
  {
    tag: "Systems",
    title: "Deadlock",
    hint: "Everyone's waiting on everyone.",
    body: "Deadlock happens when two or more processes each hold a resource the other needs, and neither will let go. Classic conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Break any one and the deadlock can't form.",
    joke: "Deadlock is just two threads being way too polite: 'No, you go first.' 'No, you.' Forever.",
  },
  {
    tag: "Theory",
    title: "Big Proofs (Induction)",
    hint: "Prove it works for all n.",
    body: "Mathematical induction proves a statement for all natural numbers by proving a base case and then showing that if it holds for k, it holds for k+1. It's basically recursion's mathematical sibling.",
    joke: "Induction is just recursion wearing a suit to convince the professor it's serious.",
  },
  {
    tag: "Theory",
    title: "P vs NP",
    hint: "The million-dollar question.",
    body: "P is the set of problems solvable quickly (polynomial time). NP is the set of problems where a solution can be verified quickly. Whether P = NP is one of the biggest open questions in computer science — solve it and you get a Turing Award (and a Millennium Prize).",
    joke: "P vs NP is unsolved, much like whether this assignment is actually due at 11:59pm or 'sometime around then'.",
  },
  {
    tag: "Databases",
    title: "SQL Joins",
    hint: "Combining tables like a pro.",
    body: "INNER JOIN keeps only matching rows across tables. LEFT JOIN keeps everything from the left table plus matches. RIGHT JOIN is the mirror. FULL OUTER JOIN keeps everything from both, matched or not.",
    joke: "Why did the SQL query break up with the NoSQL database? It just needed some structure in its life.",
  },
  {
    tag: "Networks",
    title: "TCP vs UDP",
    hint: "Reliable vs fast.",
    body: "TCP is connection-oriented and guarantees delivery and order — great for web pages and file transfers. UDP just fires packets and hopes for the best, but it's fast — great for video calls and games where speed beats perfection.",
    joke: "I would tell you a UDP joke, but you might not get it.",
  },
];

// ---------- Storage helpers ----------

const STORAGE_KEY = "studyBuddyState";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no state");
    return JSON.parse(raw);
  } catch {
    return { streak: 0, lastCheckin: null, sessionsToday: 0, lastSessionDate: null, jokesHeard: 0 };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable, ignore */
  }
}

let state = loadState();

function todayStr() {
  return new Date().toDateString();
}

function refreshStatsUI() {
  document.getElementById("streak-count").textContent = state.streak;
  document.getElementById("session-count").textContent =
    state.lastSessionDate === todayStr() ? state.sessionsToday : 0;
  document.getElementById("jokes-heard").textContent = state.jokesHeard;
}

// Reset the daily session counter if the day has changed
if (state.lastSessionDate !== todayStr()) {
  state.sessionsToday = 0;
}

// ---------- Account sync (backend) ----------

const TOKEN_KEY = "studyBuddyToken";
const USERNAME_KEY = "studyBuddyUsername";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const res = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function updateAccountUI(loggedIn, username) {
  document.getElementById("account-logged-out").classList.toggle("hidden", loggedIn);
  document.getElementById("account-logged-in").classList.toggle("hidden", !loggedIn);
  if (loggedIn) document.getElementById("account-username").textContent = username;
}

async function handleAuth(path) {
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value;
  const messageEl = document.getElementById("auth-message");
  if (!username || !password) return;
  try {
    const data = await apiRequest(path, { method: "POST", body: { username, password } });
    setSession(data.token, data.username);
    messageEl.textContent = "";
    document.getElementById("auth-username").value = "";
    document.getElementById("auth-password").value = "";
    const stats = await apiRequest("/api/stats");
    state = { ...state, ...stats };
    saveState(state);
    refreshStatsUI();
    updateAccountUI(true, data.username);
  } catch (err) {
    messageEl.textContent = err.message;
  }
}

document.getElementById("auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  handleAuth("/api/login");
});

document.getElementById("register-btn").addEventListener("click", () => {
  handleAuth("/api/register");
});

document.getElementById("logout-btn").addEventListener("click", () => {
  clearSession();
  updateAccountUI(false);
});

async function initAuth() {
  const token = getToken();
  const username = localStorage.getItem(USERNAME_KEY);
  if (!token) {
    updateAccountUI(false);
    return;
  }
  try {
    const stats = await apiRequest("/api/stats");
    state = { ...state, ...stats };
    saveState(state);
    refreshStatsUI();
    updateAccountUI(true, username);
  } catch {
    clearSession();
    updateAccountUI(false);
  }
}

initAuth();

// ---------- Streak check-in / session / joke tracking (server-synced, local fallback) ----------

function localCheckin() {
  const today = todayStr();
  if (state.lastCheckin === today) return { alreadyCheckedIn: true };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  state.streak = state.lastCheckin === yesterday.toDateString() ? state.streak + 1 : 1;
  state.lastCheckin = today;
  saveState(state);
  return { alreadyCheckedIn: false };
}

async function doCheckin() {
  let result;
  if (getToken()) {
    try {
      const data = await apiRequest("/api/checkin", { method: "POST" });
      state = { ...state, ...data };
      saveState(state);
      result = { alreadyCheckedIn: data.alreadyCheckedIn };
    } catch {
      result = localCheckin();
    }
  } else {
    result = localCheckin();
  }
  refreshStatsUI();
  if (result.alreadyCheckedIn) {
    showReaction("reaction-text", "Already checked in today. Go rest, champion. 🌙");
  } else {
    showReaction("reaction-text", `Streak extended to ${state.streak} day${state.streak === 1 ? "" : "s"}. Keep it alive! 🔥`);
  }
}

async function doSessionComplete() {
  if (getToken()) {
    try {
      const data = await apiRequest("/api/session-complete", { method: "POST" });
      state = { ...state, ...data };
      saveState(state);
      refreshStatsUI();
      return;
    } catch {
      /* fall through to local */
    }
  }
  const today = todayStr();
  if (state.lastSessionDate !== today) {
    state.lastSessionDate = today;
    state.sessionsToday = 0;
  }
  state.sessionsToday += 1;
  saveState(state);
  refreshStatsUI();
}

async function doJokeHeard() {
  if (getToken()) {
    try {
      const data = await apiRequest("/api/joke-heard", { method: "POST" });
      state = { ...state, ...data };
      saveState(state);
      refreshStatsUI();
      return;
    } catch {
      /* fall through to local */
    }
  }
  state.jokesHeard += 1;
  saveState(state);
  refreshStatsUI();
}

document.getElementById("checkin-btn").addEventListener("click", doCheckin);

// ---------- Motivation / jokes ----------

let lastQuoteIndex = -1;
let lastJokeIndex = -1;

function pickRandom(arr, lastIndex) {
  if (arr.length === 1) return { value: arr[0], index: 0 };
  let index;
  do {
    index = Math.floor(Math.random() * arr.length);
  } while (index === lastIndex);
  return { value: arr[index], index };
}

function showReaction(elId, text) {
  const el = document.getElementById(elId);
  el.textContent = text;
}

document.getElementById("motivate-btn").addEventListener("click", () => {
  const { value, index } = pickRandom(QUOTES, lastQuoteIndex);
  lastQuoteIndex = index;
  const quoteEl = document.getElementById("quote-text");
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteEl.textContent = `"${value}"`;
    quoteEl.style.opacity = 1;
  }, 120);
  showReaction("reaction-text", "");
});

document.getElementById("joke-btn").addEventListener("click", () => {
  const { value, index } = pickRandom(JOKES, lastJokeIndex);
  lastJokeIndex = index;
  const quoteEl = document.getElementById("quote-text");
  quoteEl.style.opacity = 0;
  setTimeout(() => {
    quoteEl.textContent = value;
    quoteEl.style.opacity = 1;
  }, 120);
  doJokeHeard();
  showReaction("reaction-text", "You survived another one. 😂");
});

// ---------- Pomodoro timer ----------

let timerDuration = 25 * 60;
let timerRemaining = timerDuration;
let timerInterval = null;

const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("timer-start");
const pauseBtn = document.getElementById("timer-pause");
const resetBtn = document.getElementById("timer-reset");
const timerMessage = document.getElementById("timer-message");
const modeButtons = document.querySelectorAll(".mode-btn");

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timerRemaining);
}

const TICK_MESSAGES = [
  "Still with me? Good. Keep going.",
  "Your future self is already proud of you.",
  "This is the part where most people give up. You're not most people.",
  "Breathe. Type. Repeat.",
];

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (timerInterval) return; // don't let mode switch mid-run
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    timerDuration = parseInt(btn.dataset.minutes, 10) * 60;
    timerRemaining = timerDuration;
    updateTimerDisplay();
    timerMessage.textContent = "";
  });
});

startBtn.addEventListener("click", () => {
  if (timerInterval) return;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  timerMessage.textContent = pickRandom(TICK_MESSAGES, -1).value;
  timerInterval = setInterval(() => {
    timerRemaining -= 1;
    updateTimerDisplay();
    if (timerRemaining > 0 && timerRemaining % 300 === 0) {
      timerMessage.textContent = pickRandom(TICK_MESSAGES, -1).value;
    }
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      timerMessage.textContent = "Time's up! Stretch, hydrate, and come back stronger. 🎉";
      doSessionComplete();
    }
  }, 1000);
});

pauseBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  timerMessage.textContent = "Paused. The bugs aren't going anywhere. Come back when ready.";
});

resetBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRemaining = timerDuration;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  updateTimerDisplay();
  timerMessage.textContent = "";
});

updateTimerDisplay();

// ---------- Concept flashcards ----------

const conceptsGrid = document.getElementById("concepts-grid");
const filterRow = document.getElementById("filter-row");

function renderFilters() {
  const tags = ["all", ...new Set(CONCEPTS.map((c) => c.tag))];
  tags.forEach((tag) => {
    if (tag === "all") return; // "All" button already exists in HTML
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = tag;
    btn.dataset.filter = tag;
    filterRow.appendChild(btn);
  });

  filterRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterRow.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderConcepts(btn.dataset.filter);
  });
}

function renderConcepts(filter = "all") {
  conceptsGrid.innerHTML = "";
  const list = filter === "all" ? CONCEPTS : CONCEPTS.filter((c) => c.tag === filter);

  list.forEach((concept) => {
    const card = document.createElement("div");
    card.className = "flip-card";
    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <span class="tag">${concept.tag}</span>
          <h3>${concept.title}</h3>
          <p class="hint">${concept.hint}</p>
          <span class="hint">Click to flip ↻</span>
        </div>
        <div class="flip-card-back">
          <p>${concept.body}</p>
          <p class="joke">😂 ${concept.joke}</p>
        </div>
      </div>
    `;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    conceptsGrid.appendChild(card);
  });
}

renderFilters();
renderConcepts();

// ---------- Rubber duck debugging ----------

const DUCK_RESPONSES = [
  "Quack. Have you checked if it's actually running the code you think it's running?",
  "Quack. Walk me through it line by line — out loud, slowly, like I'm five.",
  "Quack. Is that variable actually what you think it is at that point? Print it and check.",
  "Quack. Off-by-one error? It's always worth checking the off-by-one error first.",
  "Quack. Did you save the file? No really. Did you?",
  "Quack. What does the error message actually say, word for word? Read it again.",
  "Quack. Try the smallest possible input. Does it still break?",
  "Quack. Are you sure that function is being called at all?",
  "Quack. Sounds like a classic case of 'it works on my machine'. Check your environment.",
  "Quack. You explained the whole thing out loud just now — did the answer occur to you mid-sentence?",
];

document.getElementById("duck-btn").addEventListener("click", () => {
  const input = document.getElementById("duck-input").value.trim();
  const responseEl = document.getElementById("duck-response");
  if (!input) {
    responseEl.textContent = "The duck is listening. Type your bug first. 🦆";
    return;
  }
  const { value } = pickRandom(DUCK_RESPONSES, -1);
  responseEl.textContent = value;
});

// ---------- Concept Visualizer: BFS/DFS ----------

const VIZ_GRAPH = {
  A: ["B", "C"],
  B: ["A", "D"],
  C: ["A", "D", "E"],
  D: ["B", "C", "F"],
  E: ["C", "F", "G"],
  F: ["D", "E", "H"],
  G: ["E", "H"],
  H: ["F", "G"],
};

const vizCanvas = document.getElementById("viz-canvas");
const vizCtx = vizCanvas.getContext("2d");
const vizStartSelect = document.getElementById("viz-start-node");
const vizAlgoToggle = document.getElementById("viz-algo-toggle");
const vizSpeedInput = document.getElementById("viz-speed");
const vizPlayBtn = document.getElementById("viz-play");
const vizPauseBtn = document.getElementById("viz-pause");
const vizStepBtn = document.getElementById("viz-step");
const vizResetBtn = document.getElementById("viz-reset");
const vizExplanation = document.getElementById("viz-explanation");

const vizNodePositions = (() => {
  const nodes = Object.keys(VIZ_GRAPH);
  const cx = 300;
  const cy = 180;
  const radius = 140;
  const positions = {};
  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    positions[node] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  });
  return positions;
})();

let vizAlgo = "bfs";
let vizSteps = [];
let vizStepIndex = 0;
let vizTimer = null;

function buildBfsSteps(start) {
  const steps = [];
  const visited = new Set([start]);
  const queue = [start];
  steps.push({
    current: null,
    frontier: [...queue],
    frontierLabel: "Queue",
    visited: [...visited],
    explanation: `Start BFS at ${start}. Mark it visited and add it to the queue.`,
  });
  while (queue.length) {
    const node = queue.shift();
    steps.push({
      current: node,
      frontier: [...queue],
      frontierLabel: "Queue",
      visited: [...visited],
      explanation: `Dequeue ${node} and visit it.`,
    });
    for (const neighbor of VIZ_GRAPH[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        steps.push({
          current: node,
          frontier: [...queue],
          frontierLabel: "Queue",
          visited: [...visited],
          explanation: `Discover ${neighbor} from ${node}. Mark it visited and enqueue it.`,
        });
      }
    }
  }
  steps.push({
    current: null,
    frontier: [],
    frontierLabel: "Queue",
    visited: [...visited],
    explanation: `BFS complete — visited ${visited.size} of ${Object.keys(VIZ_GRAPH).length} nodes, level by level. That's O(V + E): every vertex is enqueued once, every edge is checked once.`,
  });
  return steps;
}

function buildDfsSteps(start) {
  const steps = [];
  const visited = new Set();
  const stack = [start];
  steps.push({
    current: null,
    frontier: [...stack],
    frontierLabel: "Stack",
    visited: [...visited],
    explanation: `Start DFS at ${start}. Push it onto the stack.`,
  });
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    steps.push({
      current: node,
      frontier: [...stack],
      frontierLabel: "Stack",
      visited: [...visited],
      explanation: `Pop ${node} from the stack and visit it.`,
    });
    const unvisitedNeighbors = VIZ_GRAPH[node].filter((n) => !visited.has(n));
    [...unvisitedNeighbors].reverse().forEach((neighbor) => stack.push(neighbor));
    if (unvisitedNeighbors.length) {
      steps.push({
        current: node,
        frontier: [...stack],
        frontierLabel: "Stack",
        visited: [...visited],
        explanation: `Push unvisited neighbor${unvisitedNeighbors.length === 1 ? "" : "s"} of ${node} (${unvisitedNeighbors.join(", ")}) onto the stack.`,
      });
    }
  }
  steps.push({
    current: null,
    frontier: [],
    frontierLabel: "Stack",
    visited: [...visited],
    explanation: `DFS complete — visited ${visited.size} of ${Object.keys(VIZ_GRAPH).length} nodes, diving deep before backtracking. Still O(V + E): every vertex is pushed once, every edge is checked once.`,
  });
  return steps;
}

function drawViz(step) {
  const w = vizCanvas.width;
  const h = vizCanvas.height;
  vizCtx.clearRect(0, 0, w, h);

  const visitedSet = new Set(step ? step.visited : []);
  const frontierSet = new Set(step ? step.frontier : []);
  const current = step ? step.current : null;

  vizCtx.strokeStyle = "#232b38";
  vizCtx.lineWidth = 2;
  Object.entries(VIZ_GRAPH).forEach(([node, neighbors]) => {
    neighbors.forEach((neighbor) => {
      const a = vizNodePositions[node];
      const b = vizNodePositions[neighbor];
      vizCtx.beginPath();
      vizCtx.moveTo(a.x, a.y);
      vizCtx.lineTo(b.x, b.y);
      vizCtx.stroke();
    });
  });

  Object.entries(vizNodePositions).forEach(([node, pos]) => {
    let fill = "#232b38";
    let textColor = "#e6edf3";
    if (node === current) {
      fill = "#ffd166";
      textColor = "#1a0510";
    } else if (visitedSet.has(node)) {
      fill = "#6ee7b7";
      textColor = "#04262a";
    } else if (frontierSet.has(node)) {
      fill = "#5ce1e6";
      textColor = "#04262a";
    }

    vizCtx.beginPath();
    vizCtx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
    vizCtx.fillStyle = fill;
    vizCtx.fill();
    vizCtx.strokeStyle = "#0d1117";
    vizCtx.lineWidth = 2;
    vizCtx.stroke();

    vizCtx.fillStyle = textColor;
    vizCtx.font = "bold 15px sans-serif";
    vizCtx.textAlign = "center";
    vizCtx.textBaseline = "middle";
    vizCtx.fillText(node, pos.x, pos.y);
  });

  const label = step ? `${step.frontierLabel}: [${step.frontier.join(", ") || "empty"}]` : "";
  vizCtx.fillStyle = "#8b95a5";
  vizCtx.font = "13px sans-serif";
  vizCtx.textAlign = "left";
  vizCtx.textBaseline = "top";
  vizCtx.fillText(label, 12, 12);
}

function renderVizStep() {
  const step = vizSteps[vizStepIndex];
  drawViz(step);
  vizExplanation.textContent = step ? step.explanation : "Pick an algorithm and press Play.";
}

function buildVizSteps() {
  const start = vizStartSelect.value;
  vizSteps = vizAlgo === "bfs" ? buildBfsSteps(start) : buildDfsSteps(start);
  vizStepIndex = 0;
}

function stopVizPlayback() {
  if (vizTimer) {
    clearInterval(vizTimer);
    vizTimer = null;
  }
  vizPlayBtn.disabled = false;
  vizPauseBtn.disabled = true;
}

function stepVizForward() {
  if (vizStepIndex < vizSteps.length - 1) {
    vizStepIndex += 1;
    renderVizStep();
  }
  if (vizStepIndex >= vizSteps.length - 1) {
    stopVizPlayback();
  }
}

function resetViz() {
  stopVizPlayback();
  buildVizSteps();
  renderVizStep();
}

Object.keys(VIZ_GRAPH).forEach((node) => {
  const opt = document.createElement("option");
  opt.value = node;
  opt.textContent = node;
  vizStartSelect.appendChild(opt);
});

vizAlgoToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".mode-btn");
  if (!btn) return;
  vizAlgoToggle.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  vizAlgo = btn.dataset.algo;
  resetViz();
});

vizStartSelect.addEventListener("change", resetViz);

vizPlayBtn.addEventListener("click", () => {
  if (vizStepIndex >= vizSteps.length - 1) {
    buildVizSteps();
    renderVizStep();
  }
  vizPlayBtn.disabled = true;
  vizPauseBtn.disabled = false;
  vizTimer = setInterval(stepVizForward, Number(vizSpeedInput.value));
});

vizPauseBtn.addEventListener("click", stopVizPlayback);

vizStepBtn.addEventListener("click", () => {
  stopVizPlayback();
  stepVizForward();
});

vizResetBtn.addEventListener("click", resetViz);

vizSpeedInput.addEventListener("change", () => {
  if (vizTimer) {
    clearInterval(vizTimer);
    vizTimer = setInterval(stepVizForward, Number(vizSpeedInput.value));
  }
});

resetViz();

// ---------- Init ----------

refreshStatsUI();
