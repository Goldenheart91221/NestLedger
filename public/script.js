const $ = (id) => document.getElementById(id);

let currentUser = localStorage.getItem("nestledger_current_user");

const ADMIN_EMAIL = "kajalkumarisingh407@gmail.com";
function getUsers() {
  return JSON.parse(localStorage.getItem("nestledger_users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("nestledger_users", JSON.stringify(users));
}

function getUserKey() {
  return `nestledger_data_${currentUser}`;
}

function getData() {
  return JSON.parse(
    localStorage.getItem(getUserKey()) ||
    JSON.stringify({
      budget: 45000,
      expenses: [],
     savingsGoals: []
    })
  );
}

function saveData(data) {
  localStorage.setItem(getUserKey(), JSON.stringify(data));
}

function money(amount) {
  return "\u20B9" + Number(amount || 0).toLocaleString("en-IN");
}

function toast(message) {
  const box = $("toast");

  if (!box) return;

  box.textContent = message;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 2500);
}


/* ================= AUTH ================= */

function showSignup() {
  $("loginBox").classList.add("hide");
  $("signupBox").classList.remove("hide");
}

function showLogin() {
  $("signupBox").classList.add("hide");
  $("loginBox").classList.remove("hide");
}

function signup(event) {
  if (event) event.preventDefault();

  const name = $("signupName").value.trim();
  const email = $("signupEmail").value.trim().toLowerCase();
  const password = $("signupPassword").value;

  const users = getUsers();

  if (users.some(user => user.email === email)) {
    toast("Account already exists");
    return;
  }

  users.push({
    name: name,
    email: email,
    password: password
  });

  saveUsers(users);

  $("signupForm").reset();

  toast("Account created successfully");

  showLogin();
}
/* ================= LOGIN ================= */

function login(event) {
  if (event) event.preventDefault();

  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;

  const users = getUsers();

  const user = users.find(
    item => item.email === email && item.password === password
  );

  if (!user) {
    toast("Invalid email or password");
    return;
  }

  currentUser = user.email;

  localStorage.setItem(
    "nestledger_current_user",
    currentUser
  );

  $("loginForm").reset();

  enter();
}


function googleDemo() {
  toast("Google Sign-In is not connected yet.");
}


/* ================= DASHBOARD ================= */

function enter() { const users = getUsers();
const user = users.find(item => item.email === currentUser);

if (user) {
  $("welcomeMessage").textContent =
    `Good day, ${user.name}! \u{1F44B}`;
}
  $("loginBox").classList.add("hide");
  $("signupBox").classList.add("hide");
  $("app").classList.remove("hide");

  render();
}


function logout() {
  localStorage.removeItem("nestledger_current_user");

  currentUser = null;

  $("app").classList.add("hide");
  $("signupBox").classList.add("hide");
  $("loginBox").classList.remove("hide");
}


/* ================= BUDGET ================= */

function saveBudget(event) {
  if (event) event.preventDefault();

  const amount = Number($("budgetInput").value);

  if (amount < 0) {
    toast("Enter a valid budget");
    return;
  }

  const data = getData();

  data.budget = amount;

  saveData(data);

  $("budgetInput").value = "";

  toast("Budget saved");

  render();
}


/* ================= EXPENSE ================= */

function addExpense(event) {
  if (event) event.preventDefault();

  const title = $("expenseTitle").value.trim();
  const amount = Number($("expenseAmount").value);
  const category = $("expenseCategory").value;

  if (!title || amount <= 0 || !category) {
    toast("Please fill all expense details");
    return;
  }

  const data = getData();

  data.expenses.push({
    id: Date.now(),
    title: title,
    amount: amount,
    category: category,
    date: new Date().toLocaleDateString("en-IN")
  });

  saveData(data);

  $("expenseForm").reset();

  toast("Expense added");

  render();
}


function deleteExpense(id) {
  const data = getData();

  data.expenses = data.expenses.filter(
    expense => expense.id !== id
  );

  saveData(data);

  toast("Expense deleted");

  render();
}

/* ================= SAVINGS GOALS ================= */

function addSavingsGoal(event) {
  if (event) event.preventDefault();

  const name = $("goalName").value.trim();
  const target = Number($("goalTarget").value);
  const saved = Number($("goalSaved").value);

  if (!name || target <= 0 || saved < 0 || saved > target) {
    toast("Please enter valid goal details");
    return;
  }

  const data = getData();

  if (!data.savingsGoals) {
    data.savingsGoals = [];
  }

  data.savingsGoals.push({
    id: Date.now(),
    name: name,
    target: target,
    saved: saved
  });

  saveData(data);

  $("savingsGoalForm").reset();

  toast("Savings goal added");

  renderSavingsGoals(data.savingsGoals);
}


function deleteSavingsGoal(id) {
  const data = getData();

  data.savingsGoals = (data.savingsGoals || []).filter(
    goal => goal.id !== id
  );

  saveData(data);

  toast("Savings goal deleted");

  renderSavingsGoals(data.savingsGoals);
}


function renderSavingsGoals(goals) {
  const box = $("savingsGoalsList");

  if (!box) return;

  if (!goals || !goals.length) {
    box.innerHTML = "No savings goals yet.";
    return;
  }

  box.innerHTML = goals.map(goal => {

    const percentage = Math.min(
      (goal.saved / goal.target) * 100,
      100
    );

    return `
      <div class="savings-goal">

        <div class="category-name">
          <strong>${escapeHTML(goal.name)}</strong>
          <span>
            ${money(goal.saved)} / ${money(goal.target)}
          </span>
        </div>

        <div class="category-bar">
          <div
            class="category-fill"
            style="width: ${percentage}%">
          </div>
        </div>

        <div class="progress-info">
          <span>${Math.round(percentage)}% saved</span>

          <button
            class="delete-btn"
            onclick="deleteSavingsGoal(${goal.id})">
            Delete
          </button>
        </div>

      </div>
    `;
  }).join("");
}
/* ================= ADMIN DASHBOARD ================= */

function renderAdminDashboard() { const adminNavButton = $("adminNavButton"); if (adminNavButton) adminNavButton.classList.toggle("hide", currentUser !== ADMIN_EMAIL); if (currentUser !== ADMIN_EMAIL) {
  const panel = $("adminPanel");
  if (panel) panel.classList.add("hide");
  return;
}

const panel = $("adminPanel");
if (panel) panel.classList.remove("hide");
  const users = getUsers();

  const totalUsers = $("totalUsers");
  const usersList = $("usersList");

  if (totalUsers) {
    totalUsers.textContent = users.length;
  }

  if (!usersList) return;

  if (!users.length) {
    usersList.innerHTML = "No users found.";
    return;
  }

  usersList.innerHTML = users.map(user => `
    <div class="savings-goal">
      <div class="category-name">
        <strong>${escapeHTML(user.name)}</strong>
        <span>${escapeHTML(user.email)}</span>
      </div>
    </div>
  `).join("");
}

/* ================= RENDER ================= */

function render() {
  if (!currentUser) return;

  const data = getData();

  const budget = Number(data.budget || 0);

  const spending = data.expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const remaining = budget - spending;

  $("budgetAmount").textContent = money(budget);
  $("spendingAmount").textContent = money(spending);
  $("remainingAmount").textContent = money(remaining);
const progressText = $("budgetProgressText");
const remainingText = $("budgetRemainingText");
const progressFill = $("budgetProgressFill");
const budgetAlert = $("budgetAlert");

if (budget > 0) {
  const percentage = (spending / budget) * 100;

  progressText.textContent =
    `${Math.round(percentage)}% used`;

  remainingText.textContent =
    `${money(Math.max(remaining, 0))} remaining`;

  progressFill.style.width =
    `${Math.min(percentage, 100)}%`;

  budgetAlert.classList.remove("hide");

  if (percentage >= 100) {
    budgetAlert.textContent =
      "\u26A0\uFE0F Budget limit reached or exceeded.";
  } else if (percentage >= 80) {
    budgetAlert.textContent =
      "\u26A0\uFE0F You have used more than 80% of your budget.";
  } else {
    budgetAlert.textContent =
      "\u2705 Your budget is under control.";
  }
} else {
  progressText.textContent = "0% used";
    remainingText.textContent = "\u20B90 remaining";
  progressFill.style.width = "0%";
  budgetAlert.classList.add("hide");
}
  renderExpenses(data.expenses);
renderCategoryBreakdown(data.expenses);
renderSavingsGoals(data.savingsGoals || []);
renderAdminDashboard();
renderSpendingChart(data.expenses);
  renderInsights(
    budget,
    spending,
    remaining,
    data.expenses
  );
}


/* ================= EXPENSE LIST ================= */
function renderExpenses(expenses) {
  const list = $("expenseList");

  const search =
    $("expenseSearch")?.value.trim().toLowerCase() || "";

  const filter =
    $("expenseFilter")?.value || "All";

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.title.toLowerCase().includes(search);

    const matchesCategory =
      filter === "All" ||
      expense.category === filter;

    return matchesSearch && matchesCategory;
  });

  if (!filteredExpenses.length) {
    list.innerHTML = "No matching expenses found.";
    return;
  }

  list.innerHTML = filteredExpenses
    .slice()
    .reverse()
    .map(expense => `
      <div class="expense-item">

        <div class="expense-info">
          <strong>${escapeHTML(expense.title)}</strong>

          <small>
            ${escapeHTML(expense.category)}
            \u2022
            ${escapeHTML(expense.date)}
          </small>
        </div>

        <div>
          <span class="expense-amount">
            ${money(expense.amount)}
          </span>

          <button
            class="delete-btn"
            onclick="deleteExpense(${expense.id})">
            Delete
          </button>
        </div>

      </div>
    `)
    .join("");
}
/* ================= SPENDING CHART ================= */

function renderSpendingChart(expenses) {
  const canvas = $("spendingChart");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!expenses.length) {
    ctx.font = "14px Arial";
    ctx.fillText("No expenses to show yet.", 20, 40);
    return;
  }

  const totals = {};

  expenses.forEach(expense => {
    const category = expense.category;
    totals[category] =
      (totals[category] || 0) +
      Number(expense.amount || 0);
  });

  const categories = Object.keys(totals);
  const values = Object.values(totals);

  const maxValue = Math.max(...values);
  const width = canvas.width;
  const height = canvas.height;

  const barWidth = Math.max(
    30,
    (width - 80) / categories.length - 15
  );

  categories.forEach((category, index) => {
    const x = 40 + index * (barWidth + 15);
    const barHeight =
      (values[index] / maxValue) * (height - 70);

    const y = height - barHeight - 30;

    ctx.fillStyle = "#1769e0";
    ctx.fillRect(
      x,
      y,
      barWidth,
      barHeight
    );

    ctx.fillStyle = "#172033";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      category,
      x + barWidth / 2,
      height - 10
    );

    ctx.fillText(
      "\u20B9" + values[index].toLocaleString("en-IN"),
      x + barWidth / 2,
      y - 8
    );
  });
}/* ================= CATEGORY BREAKDOWN ================= */

function renderCategoryBreakdown(expenses) {
  const box = $("categoryBreakdown");

  if (!expenses.length) {
    box.innerHTML = "No expenses to show.";
    return;
  }

  const totals = {};

  expenses.forEach(expense => {
    const category = expense.category;

    totals[category] =
      (totals[category] || 0) +
      Number(expense.amount || 0);
  });

  box.innerHTML = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => `
      <div class="category-row">
        <div class="category-name">
          <strong>${escapeHTML(category)}</strong>
          <span>${money(amount)}</span>
        </div>

        <div class="category-bar">
          <div
            class="category-fill"
            style="width: ${Math.min(
              (amount / Math.max(...Object.values(totals))) * 100,
              100
            )}%">
          </div>
        </div>
      </div>
    `)
    .join("");
}
/* ================= INSIGHTS ================= */

function renderInsights(
  budget,
  spending,
  remaining,
  expenses
) {
  const box = $("insights");

  const insights = [];

  if (budget === 0) {

    insights.push(
      "\u{1F4A1} Set your monthly budget to start tracking."
    );

  } else if (spending === 0) {

    insights.push(
      "\u{1F4A1} No expenses added yet. Your budget is currently unused."
    );

  } else {

    const percentage =
      (spending / budget) * 100;

    if (percentage >= 100) {

      insights.push(
        "\u26A0\uFE0F You have reached or exceeded your monthly budget."
      );

    } else if (percentage >= 80) {

      insights.push(
        "\u26A0\uFE0F You have used more than 80% of your monthly budget."
      );

    } else {

      insights.push(
        "\u2705 Your spending is currently below 80% of your budget."
      );
    }

    insights.push(
      `\u{1F4B0} Remaining budget: ${money(
        Math.max(remaining, 0)
      )}`
    );
  }

  if (expenses.length > 0) {

    const highest =
      getHighestCategory(expenses);

    if (highest) {

      insights.push(
        `\u{1F4CA} Highest spending category: ${
          highest.category
        } (${money(highest.amount)})`
      );
    }
  }

  box.innerHTML = insights
    .map(item =>
      `<div class="insight">${item}</div>`
    )
    .join("");
}


/* ================= HIGHEST CATEGORY ================= */

function getHighestCategory(expenses) {

  const totals = {};

  expenses.forEach(expense => {

    const category = expense.category;

    totals[category] =
      (totals[category] || 0) +
      Number(expense.amount || 0);
  });

  const entries =
    Object.entries(totals);

  if (!entries.length) {
    return null;
  }

  entries.sort(
    (a, b) => b[1] - a[1]
  );

  return {
    category: entries[0][0],
    amount: entries[0][1]
  };
}


/* ================= SECURITY ================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* ================= STARTUP ================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    $("loginForm").addEventListener(
      "submit",
      login
    );

    $("signupForm").addEventListener(
      "submit",
      signup
    );

    $("budgetForm").addEventListener(
      "submit",
      saveBudget
    );

    $("expenseForm").addEventListener(
      "submit",
      addExpense
    );

    if (currentUser) {
      enter();
    } else {
      $("app").classList.add("hide");
      $("signupBox").classList.add("hide");
      $("loginBox").classList.remove("hide");
    }
  }
);


/* ================= GLOBAL FUNCTIONS ================= */

window.showSignup = showSignup;
window.showLogin = showLogin;
window.signup = signup;
window.login = login;
window.googleDemo = googleDemo;
window.logout = logout;
window.deleteExpense = deleteExpense;
window.deleteSavingsGoal = deleteSavingsGoal;

/* ================= SEARCH & FILTER ================= */

document.addEventListener("DOMContentLoaded", () => {

  $("expenseSearch").addEventListener("input", () => {
    render();
  });

  $("expenseFilter").addEventListener("change", () => {
    render();
  });

$("savingsGoalForm").addEventListener("submit", addSavingsGoal);
});
function togglePassword(id) {
  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}
function showForgotPassword() {
  const email = prompt("Enter your registered email:");

  if (!email) return;

  const users = getUsers();
  const user = users.find(
    item => item.email === email.trim().toLowerCase()
  );

  if (!user) {
    alert("No account found with this email.");
    return;
  }

  const newPassword = prompt("Enter your new password:");

  if (!newPassword) return;

  user.password = newPassword;
  saveUsers(users);

  alert("Password reset successfully! Please login with your new password.");
}

function scrollToSection(id) {
  const accountPage = $("accountPage");

  if (accountPage) {
    accountPage.classList.add("hide");
  }

  document.querySelectorAll(".dashboard-content > section").forEach(section => {
    section.classList.remove("hide");
  });

  const section = document.getElementById(id);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

window.scrollToSection = scrollToSection;

window.scrollToSection = scrollToSection;

function toggleAccountMenu() {
  const menu = $("accountMenu");

  if (!menu) return;

  menu.classList.toggle("hide");

  const users = getUsers();
  const user = users.find(item => item.email === currentUser);

  if (user) {
    $("accountName").textContent = user.name;
    $("accountEmail").textContent = user.email;
  }
}

window.toggleAccountMenu = toggleAccountMenu;

function showAccountPage() {
  const accountPage = document.getElementById("accountPage");
  const dashboard = document.querySelector(".dashboard");
  const dashboardContent = document.querySelector(".dashboard-content");

  if (!accountPage || !dashboard) return;

  // Account page ko dashboard ke andar rakho
  if (accountPage.parentElement !== dashboard) {
    dashboard.appendChild(accountPage);
  }

  // Dashboard content hide
  if (dashboardContent) {
    dashboardContent.classList.add("hide");
  }

  // Account page show
  accountPage.classList.remove("hide");

  // User information
  const users = getUsers();
  const user = users.find(item => item.email === currentUser);

  if (user) {
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("accountFullName").textContent = user.name;
    document.getElementById("accountFullEmail").textContent = user.email;

    const avatar = document.querySelector(".account-avatar");
    if (avatar) {
      avatar.textContent = user.name.charAt(0).toUpperCase();
    }
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

window.showAccountPage = showAccountPage;


window.showAccountPage = showAccountPage;
function showDashboard() {
  const accountPage = document.getElementById("accountPage");
  const dashboard = document.querySelector(".dashboard");

  if (accountPage) {
    accountPage.classList.add("hide");
  }

  if (dashboard) {
    dashboard.classList.remove("hide");
  }
}

window.showDashboard = showDashboard;

window.toggleAccountMenu = toggleAccountMenu;