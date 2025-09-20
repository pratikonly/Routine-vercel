/* SUBJECT lists — full chapter-wise topics added */
const SUBJECT_LISTS = {
  Physics: {
    title: 'Physics — Weekly Checklist',
    mainTopics: [
      { title: 'Ch-1: Unit & Measurement' },
      { title: 'Ch-2: Motion in Straight Line' },
      { title: 'Ch-3: Motion in Plane' },
      { title: 'Ch-4: Laws of Motion' },
      { title: 'Ch-5: Work, Energy and Power' }
    ]
  },
  Chemistry: {
    title: 'Chemistry — Weekly Checklist',
    mainTopics: [
      { title: 'Ch-1: Some Basic Concept' },
      { title: 'Ch-2: Structure of Atom' },
      { title: 'Ch-3: Classification of Elements' },
      { title: 'Ch-4: Chemical Bonding' },
      { title: 'Ch-5: Thermodynamics' }
    ]
  },
  Mathematics: {
    title: 'Mathematics — Weekly Checklist',
    mainTopics: [
      { title: 'Ch-1: Sets' },
      { title: 'Ch-2: Relations & Functions' },
      { title: 'Ch-3: Trigonometric Equations' },
      { title: 'Ch-4: Complex Numbers' },
      { title: 'Ch-5: Linear Inequalities' },
      { title: 'Ch-6: Permutations & Combinations' }
    ]
  },
  CS: {
    title: 'Computer Science — Weekly Checklist',
    mainTopics: [
      { title: 'Ch-1: Computer System' },
      { title: 'Ch-2: Data Representation' },
      { title: 'Ch-3: Boolean Logic' },
      { title: 'Ch-4: Problem Solving' }
    ]
  },
  English: {
    title: 'English — Weekly Checklist',
    mainTopics: [
      { title: 'Ch-1: The Portrait of a Lady' },
      { title: 'Ch-2: A Photograph' },
      { title: 'Ch-3: We’re Not Afraid to Die…' },
      { title: 'Ch-4: Discovering Tut' },
      { title: 'Ch-5: The Laburnum Top' },
      { title: 'Ch-6: The Ailing Planet' },
      { title: 'Ch-7: The Summer of the Beautiful White Horse' },
      { title: 'Ch-8: The Address' },
      { title: 'Ch-9: Mother’s Day' },
      { title: 'Ch-10: Birth' }
    ]
  }
};

/* Popup management */
const overlay = document.getElementById('overlay');
const popupRoot = document.getElementById('popup-root');
const navButtons = document.querySelectorAll('.nav-btn');

// Set short labels for all views
function setNavLabelsForAll() {
  const mapping = { Physics: 'Phy', Chemistry: 'Chem', Mathematics: 'Math', CS: 'CS', English: 'Eng' };
  navButtons.forEach(btn => {
    const k = btn.getAttribute('data-subject');
    if (k) btn.textContent = mapping[k] || k;
  });
}
setNavLabelsForAll();

/* create and show popup */
function createPopup(subjectKey) {
  const data = SUBJECT_LISTS[subjectKey];
  if (!data) return;

  // show overlay
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');

  // build popup element
  const pop = document.createElement('div');
  pop.className = 'popup enter';
  pop.innerHTML = `
    <div class="popup-header" role="dialog" aria-label="${escapeHtml(data.title)}">
      <div style="display:flex;align-items:center;gap:8px">
        <div class="popup-handle" aria-hidden="true" style="width:36px;height:6px;border-radius:4px;background:#00ff80"></div>
        <div class="popup-title">${escapeHtml(data.title)}</div>
      </div>
      <button class="popup-close" aria-label="Close">✕</button>
    </div>
    <div class="popup-body">
      ${data.mainTopics.map(mainTopic => `
        <div class="main-topic">
          <div class="main-topic-title">${escapeHtml(mainTopic.title)}</div>
        </div>
      `).join('')}
    </div>
  `;

  popupRoot.appendChild(pop);

  // center (default) then allow drag
  const existing = document.querySelectorAll('.popup').length;
  pop.style.left = `calc(50% + ${existing * 8}px)`;
  pop.style.top = `calc(50% + ${existing * 6}px)`;
  pop.style.transform = 'translate(-50%,-50%)';

  // close button
  pop.querySelector('.popup-close').addEventListener('click', () => {
    pop.remove();
    if (document.querySelectorAll('.popup').length === 0) {
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden', 'true');
    }
  });

  // overlay click closes (mobile-friendly)
  function onOverlayClick(e) {
    if (e.target === overlay) {
      pop.remove();
      if (document.querySelectorAll('.popup').length === 0) {
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.removeEventListener('click', onOverlayClick);
      }
    }
  }
  overlay.addEventListener('click', onOverlayClick);

  // draggable (mouse + touch)
  makeDraggable(pop, pop.querySelector('.popup-header'));
}

/* attach nav handlers */
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-subject');
    if (key) createPopup(key);
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { btn.click(); e.preventDefault(); }
  });
});

/* dragging helper */
function makeDraggable(el, handle) {
  let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;
  el.style.position = 'fixed';

  function getNumPx(v) { return parseFloat(v) || 0; }

  handle.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    el.style.transform = 'translate(0,0)';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });

  function onMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = (origX + dx) + 'px';
    el.style.top = (origY + dy) + 'px';
  }
  function onUp() {
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }

  // touch
  handle.addEventListener('touchstart', (ev) => {
    const t = ev.touches[0];
    dragging = true;
    startX = t.clientX; startY = t.clientY;
    const rect = el.getBoundingClientRect();
    origX = rect.left; origY = rect.top;
    el.style.transform = 'translate(0,0)';
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    ev.preventDefault();
  }, { passive: false });

  function onTouchMove(ev) {
    if (!dragging) return;
    const t = ev.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    el.style.left = (origX + dx) + 'px';
    el.style.top = (origX + dx) + 'px';
    ev.preventDefault();
  }
  function onTouchEnd() {
    dragging = false;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  }
}

/* util */
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

/* Dynamic rendering and forms */
async function loadSchedule() {
  const week = document.getElementById('week');
  week.innerHTML = '';
  try {
    const res = await fetch('/api/days');
    const days = await res.json();
    days.forEach(day => {
      const dayContainer = createDayContainer(day);
      week.appendChild(dayContainer);
    });
  } catch (err) {
    console.error('Error loading schedule:', err);
  }
}

function createDayContainer(day) {
  const container = document.createElement('section');
  container.className = 'day-container';
  const date = new Date(day.date);
  const isWeekend = day.day_name === 'Saturday' || day.day_name === 'Sunday';
  const isMonthEnd = date.getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  if (isWeekend) container.classList.add('weekend-separator');
  if (isMonthEnd) container.classList.add('monthend-separator');

  // Add day box
  const dayBox = document.createElement('aside');
  dayBox.className = 'day-box';
  if (isWeekend) dayBox.classList.add('weekend');
  if (day.day_name === 'Wednesday') dayBox.classList.add('wednesday');
  dayBox.dataset.day = day.day_name;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  dayBox.innerHTML = `<h3>${day.day_name}</h3><p>${formattedDate}</p>`;
  container.appendChild(dayBox);

  // Task area
  const taskArea = document.createElement('div');
  taskArea.className = 'task-area';
  day.tasks.forEach(task => {
    const taskCard = createTaskCard(task, day.day_name);
    taskArea.appendChild(taskCard);
  });

  // Add task button
  const addTaskBtn = document.createElement('button');
  addTaskBtn.textContent = '+';
  addTaskBtn.className = 'add-task-btn';
  addTaskBtn.style.marginTop = '10px';
  addTaskBtn.onclick = () => showAddTaskForm(day.id);
  taskArea.appendChild(addTaskBtn);

  container.appendChild(taskArea);
  return container;
}

function createTaskCard(task, dayName) {
  const card = document.createElement('article');
  card.className = 'task-card';
  if (dayName === 'Saturday' || dayName === 'Sunday') card.classList.add('weekend');
  if (dayName === 'Wednesday') card.classList.add('wednesday');
  const timeFrom = new Date(`1970-01-01T${task.time_from}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  const timeTo = new Date(`1970-01-01T${task.time_to}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  card.innerHTML = `
    <div class="time">${timeFrom} – ${timeTo} <span class="Total-time">[ ${task.duration} ]</span></div>
    <div class="title">${escapeHtml(task.title)}</div>
    <div class="desc">${escapeHtml(task.description)}</div>
  `;
  // Delete button
  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.className = 'popup-close';
  delBtn.onclick = () => deleteTask(task.id);
  card.appendChild(delBtn);
  return card;
}

function showAddRoutineForm() {
  const pop = createFormPopup('Add Routine', [
    { label: 'Day Name', id: 'day_name', type: 'text' },
    { label: 'Date (YYYY-MM-DD)', id: 'date', type: 'date' }
  ], async (data) => {
    await fetch('/api/days', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    loadSchedule();
  });
}

function showAddTaskForm(dayId) {
  const pop = createFormPopup('Add Task', [
    { label: 'From (HH:MM)', id: 'time_from', type: 'time' },
    { label: 'To (HH:MM)', id: 'time_to', type: 'time' },
    { label: 'Title', id: 'title', type: 'text' },
    { label: 'Description', id: 'description', type: 'text' }
  ], async (data) => {
    // Calculate duration
    const from = new Date(`1970-01-01T${data.time_from}:00`);
    const to = new Date(`1970-01-01T${data.time_to}:00`);
    const diffHours = (to - from) / (1000 * 60 * 60);
    data.duration = `${diffHours}h`;
    data.day_id = dayId;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    loadSchedule();
  });
}

function createFormPopup(title, fields, onSubmit) {
  const pop = document.createElement('div');
  pop.className = 'popup enter';
  let inner = `<div class="popup-header"><div class="popup-title">${escapeHtml(title)}</div><button class="popup-close" aria-label="Close">✕</button></div><div class="popup-body"><form id="popup-form">`;
  fields.forEach(f => {
    inner += `<label>${f.label}: <input type="${f.type}" id="${f.id}" required></label><br>`;
  });
  inner += `<button type="submit">Submit</button></form></div>`;
  pop.innerHTML = inner;
  popupRoot.appendChild(pop);
  overlay.classList.remove('hidden');
  const form = pop.querySelector('#popup-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = {};
    fields.forEach(f => { data[f.id] = form.querySelector(`#${f.id}`).value; });
    await onSubmit(data);
    pop.remove();
    if (!document.querySelector('.popup')) overlay.classList.add('hidden');
  };
  pop.querySelector('.popup-close').onclick = () => { pop.remove(); if (!document.querySelector('.popup')) overlay.classList.add('hidden'); };
  makeDraggable(pop, pop.querySelector('.popup-header'));
  return pop;
}

async function deleteTask(id) {
  if (confirm('Delete this task?')) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadSchedule();
  }
}

// Event listeners
document.getElementById('add-routine-btn').addEventListener('click', showAddRoutineForm);

// Load on start
loadSchedule();
