const form = document.getElementById('task-form');
const input = document.getElementById('new-task');
const prioritySelect = document.getElementById('task-priority');
const dueDateInput = document.getElementById('task-due-date');
const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('[data-filter]');

let tasks = JSON.parse(localStorage.getItem('todos') || '[]');
let activeFilter = 'all';

// Migrate tasks saved before priority/dueDate existed
tasks = tasks.map((task) => ({
  id: task.id || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
  text: task.text || '',
  completed: !!task.completed,
  priority: task.priority || 'medium',
  dueDate: task.dueDate || null,
  createdAt: task.createdAt || Date.now(),
}));

function save() {
  localStorage.setItem('todos', JSON.stringify(tasks));
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function createTask(text, priority, dueDate) {
  return {
    id: createId(),
    text,
    completed: false,
    priority,
    dueDate,
    createdAt: Date.now(),
  };
}

function getFilteredTasks() {
  if (activeFilter === 'active') return tasks.filter((t) => !t.completed);
  if (activeFilter === 'completed') return tasks.filter((t) => t.completed);
  return tasks;
}

function updateEmptyState(filtered) {
  if (filtered.length > 0) {
    emptyState.hidden = true;
    return;
  }
  emptyState.hidden = false;
  if (activeFilter === 'active') emptyState.textContent = 'No active tasks';
  else if (activeFilter === 'completed') emptyState.textContent = 'No completed tasks';
  else emptyState.textContent = 'No tasks';
}

function formatDueDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const due = new Date(task.dueDate + 'T23:59:59');
  return due < new Date();
}

function render() {
  const filtered = getFilteredTasks();
  list.innerHTML = '';
  updateEmptyState(filtered);

  filtered.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task';
    if (task.completed) item.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${task.id}`;
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const badge = document.createElement('span');
    badge.className = `badge badge-${task.priority}`;
    badge.textContent = task.priority;

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = task.text;
    label.title = 'Double-click to edit';
    label.addEventListener('dblclick', () => startEdit(task.id, label));

    item.append(checkbox, badge, label);

    if (task.dueDate) {
      const due = document.createElement('span');
      due.className = 'due-date';
      if (isOverdue(task)) {
        due.classList.add('overdue');
        due.textContent = `Overdue: ${formatDueDate(task.dueDate)}`;
      } else {
        due.textContent = `Due: ${formatDueDate(task.dueDate)}`;
      }
      item.append(due);
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(task.id));
    item.append(deleteButton);

    list.append(item);
  });
}

function startEdit(id, labelEl) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = task.text;
  editInput.className = 'edit-input';
  labelEl.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let done = false;
  function commit(shouldSave) {
    if (done) return;
    done = true;
    const newText = editInput.value.trim();
    if (shouldSave && newText) {
      task.text = newText;
      save();
    }
    render();
  }

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit(true);
    else if (e.key === 'Escape') commit(false);
  });
  editInput.addEventListener('blur', () => commit(true));
}

function setFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.filter === activeFilter));
  });
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value || null;
  tasks.push(createTask(text, priority, dueDate));
  input.value = '';
  dueDateInput.value = '';
  prioritySelect.value = 'medium';
  save();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

render();