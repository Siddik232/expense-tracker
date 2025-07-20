const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionsUl = document.getElementById("transactions");
const form = document.getElementById("transaction-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");

// Store transactions as an object with id as key for O(1) access
let transactions = JSON.parse(localStorage.getItem('transactions_v3') || "{}");
let editingId = null; // current transaction being edited

const categoryIcons = {
  salary: "💼", food: "🍔", rent: "🏠", travel: "✈️", others: "📦"
};

// ---------- Event handling ----------

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const transaction = {
    id: editingId || Date.now().toString(),
    text: text.value.trim(),
    amount: +amount.value,
    category: category.value
  };

  transactions[transaction.id] = transaction;
  editingId = null;
  form.reset();

  saveAndRender();
});

// Event delegation for edit/delete
transactionsUl.addEventListener('click', function (e) {
  const li = e.target.closest('li[data-id]');
  if (!li) return;
  const id = li.getAttribute('data-id');

  if (e.target.classList.contains('delete-btn')) {
    delete transactions[id];
    removeTransactionFromDOM(id);
    saveAndRender({ domOnly: true }); // Fast: only summary/charts
  } else if (e.target.classList.contains('edit-btn')) {
    const t = transactions[id];
    text.value = t.text;
    amount.value = t.amount;
    category.value = t.category;
    editingId = t.id;
    text.focus();
  }
});

// ---------- DOM updates ----------

// Only update summary/charts unless fullRender=true
function saveAndRender({ domOnly = false } = {}) {
  localStorage.setItem('transactions_v3', JSON.stringify(transactions));
  updateSummary();
  updateCharts();
  if (!domOnly) updateDOM();
}

// Renders all items - only needed after load or initial changes
function updateDOM() {
  transactionsUl.innerHTML = "";
  Object.values(transactions)
    .sort((a, b) => b.id - a.id) // Newest on top
    .forEach(transaction => {
      const li = createTransactionItem(transaction);
      transactionsUl.appendChild(li);
    });
}

function createTransactionItem(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const type = transaction.amount < 0 ? "expense" : "income";
  const li = document.createElement("li");
  li.dataset.id = transaction.id;
  li.className = type;
  li.innerHTML =
    `<span>
      <span style="font-size:1.1em; margin-right: 7px">${categoryIcons[transaction.category] || '📥'}</span>
      <b>${transaction.text}</b>
      <span style="opacity:.7; margin-left:6px; font-size:.95em;">[${transaction.category}]</span>
    </span>
    <span>
      ${sign}₹${Math.abs(transaction.amount)}
      <button class="edit-btn" title="Edit">✏️</button>
      <button class="delete-btn" title="Delete">❌</button>
    </span>`;
  return li;
}

function removeTransactionFromDOM(id) {
  const li = transactionsUl.querySelector(`li[data-id='${id}']`);
  if (li) li.remove();
}

function updateSummary() {
  const allTrans = Object.values(transactions);
  const amounts = allTrans.map(t => t.amount);
  const total = amounts.reduce((a, b) => a + b, 0).toFixed(2);
  const income = amounts.filter(n => n > 0).reduce((a, b) => a + b, 0).toFixed(2);
  const expense = (-amounts.filter(n => n < 0).reduce((a, b) => a + b, 0)).toFixed(2);
  balanceEl.textContent = `₹${total}`;
  incomeEl.textContent = `₹${income}`;
  expenseEl.textContent = `₹${expense}`;
}

// ---------------- Chart.js dynamic updates -----------------
let pieChart = null, barChart = null;
function updateCharts() {
  const allTrans = Object.values(transactions);
  const categories = {};
  allTrans.forEach(t => {
    if (!categories[t.category]) categories[t.category] = 0;
    categories[t.category] += t.amount;
  });
  const labels = Object.keys(categories);
  const data = Object.values(categories);

  // Pie
  if (pieChart) pieChart.destroy();
  if (window.pieChartCanvas) window.pieChartCanvas.remove();
  const pieCtx = document.createElement('canvas');
  pieCtx.id = "pieChart";
  document.querySelector(".charts").prepend(pieCtx);
  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ["#f1c40f", "#e67e22", "#2ecc71", "#3498db", "#9b59b6"]
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });
  window.pieChartCanvas = pieCtx;

  // Bar
  if (barChart) barChart.destroy();
  if (window.barChartCanvas) window.barChartCanvas.remove();
  const barCtx = document.createElement('canvas');
  barCtx.id = "barChart";
  document.querySelector(".charts").appendChild(barCtx);
  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Transactions",
        data,
        backgroundColor: "rgba(241, 196, 15, 0.7)"
      }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
  window.barChartCanvas = barCtx;
}

// ---------- On first load ----------
if (Object.keys(transactions).length === 0) {
  // backward compatibility: try to import old array and migrate
  const oldArr = JSON.parse(localStorage.getItem('transactions') || "[]");
  if (Array.isArray(oldArr) && oldArr.length) {
    transactions = {};
    oldArr.forEach(t => transactions[t.id] = t);
    localStorage.setItem('transactions_v3', JSON.stringify(transactions));
  }
}
updateDOM();
updateSummary();
updateCharts();
