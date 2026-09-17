const $ = (id) => document.getElementById(id);

let currentUser = localStorage.getItem("nestledger_current_user");

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
      expenses: []
    })
  );
}

function saveData(data) {
  localStorage.setItem(getUserKey(), JSON.stringify(data));
}

function money(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
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
  const email = "demo@nestledger.com";

  const users = getUsers();

  if (!users.some(user => user.email === email)) {
    users.push({
      name: "Demo User",
      email: email,
      password: "demo123"
    });

    saveUsers(users);
  }

  currentUser = email;

  localStorage.setItem(
    "nestledger_current_user",
    currentUser
  );

  enter();
}


/* ================= DASHBOARD ================= */

function enter() {
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

  renderExpenses(data.expenses);
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

  if (!expenses.length) {
    list.innerHTML = "No expenses yet.";
    return;
  }

  list.innerHTML = expenses
    .slice()
    .reverse()
    .map(expense => `
      <div class="expense-item">

        <div class="expense-info">
          <strong>${escapeHTML(expense.title)}</strong>

          <small>
            ${escapeHTML(expense.category)}
            •
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
      "💡 Set your monthly budget to start tracking."
    );

  } else if (spending === 0) {

    insights.push(
      "💡 No expenses added yet. Your budget is currently unused."
    );

  } else {

    const percentage =
      (spending / budget) * 100;

    if (percentage >= 100) {

      insights.push(
        "⚠️ You have reached or exceeded your monthly budget."
      );

    } else if (percentage >= 80) {

      insights.push(
        "⚠️ You have used more than 80% of your monthly budget."
      );

    } else {

      insights.push(
        "✅ Your spending is currently below 80% of your budget."
      );
    }

    insights.push(
      `💰 Remaining budget: ${money(
        Math.max(remaining, 0)
      )}`
    );
  }

  if (expenses.length > 0) {

    const highest =
      getHighestCategory(expenses);

    if (highest) {

      insights.push(
        `📊 Highest spending category: ${
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