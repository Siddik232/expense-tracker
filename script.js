const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionsUl = document.getElementById("transactions");
const form = document.getElementById("transaction-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");

const categoryIcons = {
  salary: "💼", food: "🍔", rent: "🏠", travel: "✈️", others: "📦"
};

let transactions = [];

// ---------- API Calls ----------

async function getTransactions() {
  try {
    const res = await fetch('/api/transactions');
    const data = await res.json();
    transactions = data.data;
    updateDOM();
    updateSummary();
    updateCharts();
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}

async function addTransaction(transaction) {
  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transaction)
    });
    const data = await res.json();
    transactions.push(data.data); // Add the server-returned transaction (with _id)
    updateDOM();
    updateSummary();
    updateCharts();
  } catch (err) {
    console.error('Error adding transaction:', err);
  }
}

async function deleteTransaction(id) {
  try {
    await fetch(`/api/transactions/${id}`, {
      method: 'DELETE'
    });
    transactions = transactions.filter(t => t._id !== id);
    removeTransactionFromDOM(id);
    updateSummary();
    updateCharts();
  } catch (err) {
    console.error('Error deleting transaction:', err);
  }
}

// ---------- Event handling ----------

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const newTransaction = {
    text: text.value.trim(),
    amount: +amount.value,
    category: category.value || 'others'
  };

  addTransaction(newTransaction);
  form.reset();
});

// Event delegation for edit/delete
transactionsUl.addEventListener('click', function (e) {
  const li = e.target.closest('li[data-id]');
  if (!li) return;
  const id = li.getAttribute('data-id');

  if (e.target.classList.contains('delete-btn')) {
    deleteTransaction(id);
  } else if (e.target.classList.contains('edit-btn')) {
    // For simplicity in this v1 API, we'll just populate form and DELETE the old one 
    // effectively "updating" by replacing. Real apps would use PUT/PATCH.
    const t = transactions.find(tr => tr._id === id);
    if (t) {
      text.value = t.text;
      amount.value = t.amount;
      category.value = t.category;
      deleteTransaction(id); // Delete old one, user will submit new one
      text.focus();
    }
  }
});

// ---------- DOM updates ----------

// Renders all items - only needed after load or initial changes
function updateDOM() {
  transactionsUl.innerHTML = "";
  // MongoDB uses _id, so we sort by createdAt if available, or just reverse
  transactions.forEach(transaction => {
    const li = createTransactionItem(transaction);
    transactionsUl.appendChild(li); // backend sort is descending usually, but we can prepend if needed
  });
}

function createTransactionItem(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const type = transaction.amount < 0 ? "expense" : "income";
  const li = document.createElement("li");
  li.dataset.id = transaction._id; // MongoDB ID
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
  const amounts = transactions.map(t => t.amount);
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
  const categories = {};
  transactions.forEach(t => {
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
  const chartsContainer = document.querySelector(".charts");
  if (chartsContainer) {
    chartsContainer.prepend(pieCtx);
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
  }

  // Bar
  if (barChart) barChart.destroy();
  if (window.barChartCanvas) window.barChartCanvas.remove();
  const barCtx = document.createElement('canvas');
  barCtx.id = "barChart";
  if (chartsContainer) {
    chartsContainer.appendChild(barCtx);
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
}

// Initialize
getTransactions();

