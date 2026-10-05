const form = document.getElementById('task-form');
const input = document.getElementById('new-task');
const list = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('[data-filter]');

let tasks = JSON.parse(localStorage.getItem('todos') || '[]');
let activeFilter = 'all';

function save() {
  localStorage.setItem('todos', JSON.stringify(tasks));
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function createTask(text) {
  return {
    id: createId(),
    text,
    completed: false,
  };
}

function getFilteredTasks() {
  if (activeFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (activeFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateEmptyState(filteredTasks) {
  if (filteredTasks.length > 0) {
    emptyState.hidden = true;
    return;
  }

  emptyState.hidden = false;

  if (activeFilter === 'active') {
    emptyState.textContent = 'No active tasks';
  } else if (activeFilter === 'completed') {
    emptyState.textContent = 'No completed tasks';
  } else {
    emptyState.textContent = 'No tasks';
  }
}

function render() {
  const filteredTasks = getFilteredTasks();

  list.innerHTML = '';
  updateEmptyState(filteredTasks);

  filteredTasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${task.id}`;
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    item.append(checkbox, label, deleteButton);
    list.append(item);
  });
}

function setFilter(filter) {
  activeFilter = filter;

  filterButtons.forEach((button) => {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.filter === activeFilter)
    );
  });

  render();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return;
  }

  task.completed = !task.completed;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  save();
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const value = input.value.trim();

  if (!value) {
    return;
  }

  tasks.push(createTask(value));
  input.value = '';
  save();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
  });
});

render();