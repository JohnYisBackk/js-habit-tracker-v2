"use strict";

// ======================================================
// SELECT ELEMENTS
// ======================================================

const todayDate = document.getElementById("todayDate");

const habitForm = document.getElementById("habitForm");

const habitInput = document.getElementById("habitInput");
const categoryInput = document.getElementById("categoryInput");
const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");

const scoreText = document.getElementById("scoreText");
const scoreMessage = document.getElementById("scoreMessage");
const completedToday = document.getElementById("completedToday");
const totalHabits = document.getElementById("totalHabits");
const doneToday = document.getElementById("doneToday");
const bestStreak = document.getElementById("bestStreak");

const scoreRing = document.querySelector(".score-ring");

const habitsList = document.getElementById("habitsList");

// ======================================================
// HABIT STATE
// ======================================================

let habits = [];

// ======================================================
// DATE HELPERS
// ======================================================

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function renderTodayDate() {
  todayDate.textContent = new Date().toLocaleDateString();
}

// ======================================================
// STORAGE SYSTEM
// ======================================================

function saveHabits() {
  localStorage.setItem("habitTracker", JSON.stringify(habits));
}

function loadHabits() {
  const storedHabits = localStorage.getItem("habitTracker");

  if (!storedHabits) return;

  habits = JSON.parse(storedHabits);
}

// ======================================================
// HABIT ACTIONS
// ======================================================

function addHabit() {
  const habit = {
    id: Date.now(),
    name: habitInput.value.trim(),
    category: categoryInput.value,
    completedDates: [],
  };

  habits.push(habit);

  saveHabits();
  renderHabits();
  renderStats();

  habitForm.reset();
}

function deleteHabit(id) {
  habits = habits.filter((habit) => {
    return habit.id !== id;
  });

  saveHabits();
  renderHabits();
  renderStats();
}

function toggleHabit(id) {
  const habit = habits.find((habit) => {
    return habit.id === id;
  });

  if (!habit) return;

  const today = getTodayKey();

  const isDoneToday = habit.completedDates.includes(today);

  if (isDoneToday) {
    habit.completedDates = habit.completedDates.filter((date) => {
      return date !== today;
    });
  } else {
    habit.completedDates.push(today);
  }

  saveHabits();
  renderHabits();
  renderStats();
}

// ======================================================
// FILTERING SYSTEM
// ======================================================

function getFilteredHabits() {
  let filteredHabits = [...habits];

  const searchValue = searchInput.value.toLowerCase().trim();

  if (searchValue !== "") {
    filteredHabits = filteredHabits.filter((habit) => {
      return habit.name.toLowerCase().includes(searchValue);
    });
  }

  const categoryValue = filterInput.value;

  if (categoryValue !== "all") {
    filteredHabits = filteredHabits.filter((habit) => {
      return habit.category === categoryValue;
    });
  }

  return filteredHabits;
}

// ======================================================
// HELPERS
// ======================================================

function isHabitDoneToday(habit) {
  const today = getTodayKey();

  return habit.completedDates.includes(today);
}

function getHabitStreak(habit) {
  return habit.completedDates.length;
}

function getCompletionScore() {
  if (habits.length === 0) return 0;

  const completed = habits.filter((habit) => {
    return isHabitDoneToday(habit);
  }).length;

  return Math.round((completed / habits.length) * 100);
}

// ======================================================
// UI RENDERING
// ======================================================

function renderHabits() {
  habitsList.innerHTML = "";

  const filteredHabits = getFilteredHabits();

  if (filteredHabits.length === 0) {
    habitsList.innerHTML = `
    <div class="empty-habits">
        <h3>No habits found</h3>
        <p>Add your first habit or try another search/filter.</p>
    </div>
    `;

    return;
  }

  filteredHabits.forEach((habit) => {
    const done = isHabitDoneToday(habit);
    const streak = getHabitStreak(habit);

    habitsList.innerHTML += `
       <article class="habit-row">
        <button class="check-btn ${done ? "done" : ""}" data-id="${habit.id}">
          ✓
        </button>

        <div class="habit-info">
          <h3>${habit.name}</h3>
          <span>${habit.category}</span>
        </div>

        <div class="streak-box">
          🔥 ${streak}
        </div>

        <div class="status-pill ${done ? "done" : ""}">
          ${done ? "Done" : "Pending"}
        </div>

        <button class="delete-habit" data-id="${habit.id}">
          ×
        </button>
      </article>
    `;
  });
}

function renderStats() {
  const doneCount = habits.filter((habit) => {
    return isHabitDoneToday(habit);
  }).length;

  const best =
    habits.length === 0
      ? 0
      : Math.max(
          ...habits.map((habit) => {
            return getHabitStreak(habit);
          }),
        );

  const score = getCompletionScore();

  totalHabits.textContent = habits.length;
  doneToday.textContent = doneCount;
  bestStreak.textContent = best;

  scoreText.textContent = `${score}%`;
  completedToday.textContent = `${doneCount}/${habits.length}`;

  if (score === 0) {
    scoreMessage.textContent = "Start with one small win today.";
  } else if (score < 50) {
    scoreMessage.textContent = "Keep going. Every check counts.";
  } else if (score < 100) {
    scoreMessage.textContent = "Strong progress today.";
  } else {
    scoreMessage.textContent = "Perfect day. Streak mode activated.";
  }

  scoreRing.style.setProperty("--score-deg", `${score * 3.6}deg`);
}

// ======================================================
// FORM HANDLING
// ======================================================

habitForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (habitInput.value.trim() === "") return;

  addHabit();
});

// ======================================================
// EVENT LISTENERS
// ======================================================

searchInput.addEventListener("input", renderHabits);

filterInput.addEventListener("change", renderHabits);

habitsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("check-btn")) {
    const id = Number(e.target.dataset.id);

    toggleHabit(id);
  }

  if (e.target.classList.contains("delete-habit")) {
    const id = Number(e.target.dataset.id);

    deleteHabit(id);
  }
});

// ======================================================
// INITIAL LOAD
// ======================================================

loadHabits();
renderTodayDate();
renderHabits();
renderStats();
