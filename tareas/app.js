(function () {
  'use strict';

  var STORAGE_KEY = 'tareas-diarias-v1';

  // ---------- Fechas (siempre en hora local, formato YYYY-MM-DD) ----------
  function toKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  function fromKey(key) {
    var p = key.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function todayKey() { return toKey(new Date()); }
  function addDays(key, n) {
    var d = fromKey(key);
    d.setDate(d.getDate() + n);
    return toKey(d);
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function longDate(key) {
    return capitalize(fromKey(key).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }));
  }
  function shortDate(key) {
    return fromKey(key).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
  function dayTitle(key) {
    var t = todayKey();
    if (key === t) return 'Hoy';
    if (key === addDays(t, -1)) return 'Ayer';
    if (key === addDays(t, 1)) return 'Mañana';
    return capitalize(fromKey(key).toLocaleDateString('es-ES', { weekday: 'long' }));
  }

  // ---------- Datos ----------
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      alert('No se pudieron guardar los cambios en este navegador.');
    }
  }
  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function findTask(id) {
    for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) return tasks[i];
    return null;
  }

  var tasks = load();
  var currentDay = todayKey();
  var editingId = null;

  // ---------- Elementos ----------
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    title: $('day-title'),
    subtitle: $('day-subtitle'),
    prev: $('prev-day'),
    next: $('next-day'),
    today: $('go-today'),
    form: $('add-form'),
    input: $('new-task'),
    list: $('task-list'),
    empty: $('empty-msg'),
    bar: $('progress-bar'),
    fill: $('progress-fill'),
    progressText: $('progress-text'),
    pending: $('pending'),
    pendingList: $('pending-list'),
    moveAll: $('move-all')
  };

  // ---------- Render ----------
  function render() {
    var t = todayKey();
    els.title.textContent = dayTitle(currentDay);
    els.subtitle.textContent = longDate(currentDay);
    els.today.hidden = currentDay === t;

    var dayTasks = tasks.filter(function (x) { return x.date === currentDay; });
    renderList(dayTasks);
    renderProgress(dayTasks);
    renderPending(t);
  }

  function renderList(dayTasks) {
    els.list.textContent = '';
    dayTasks.forEach(function (task) {
      els.list.appendChild(taskItem(task));
    });
    els.empty.hidden = dayTasks.length > 0;
  }

  function taskItem(task) {
    var li = document.createElement('li');
    li.className = 'task' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.done;
    cb.setAttribute('aria-label', 'Completar: ' + task.text);
    cb.addEventListener('change', function () {
      task.done = cb.checked;
      save();
      render();
    });
    li.appendChild(cb);

    if (editingId === task.id) {
      li.appendChild(editInput(task));
    } else {
      var span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;
      span.title = 'Doble clic para editar';
      span.addEventListener('dblclick', function () { startEdit(task.id); });
      li.appendChild(span);
    }

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete-btn';
    del.innerHTML = '&times;';
    del.setAttribute('aria-label', 'Borrar: ' + task.text);
    del.addEventListener('click', function () {
      tasks = tasks.filter(function (x) { return x.id !== task.id; });
      save();
      render();
    });
    li.appendChild(del);

    return li;
  }

  function editInput(task) {
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit';
    input.value = task.text;
    input.maxLength = 200;
    input.setAttribute('aria-label', 'Editar tarea');
    var finished = false;

    function finish(saveIt) {
      if (finished) return;
      finished = true;
      var v = input.value.trim();
      if (saveIt && v) {
        task.text = v;
        save();
      }
      editingId = null;
      render();
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    // Al hacer clic fuera se guarda (comportamiento habitual en listas de tareas)
    input.addEventListener('blur', function () { finish(true); });

    setTimeout(function () {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
    return input;
  }

  function startEdit(id) {
    editingId = id;
    render();
  }

  function renderProgress(dayTasks) {
    var total = dayTasks.length;
    var done = dayTasks.filter(function (x) { return x.done; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;

    els.fill.style.width = pct + '%';
    els.fill.classList.toggle('complete', total > 0 && done === total);
    els.bar.setAttribute('aria-valuenow', String(pct));

    if (!total) {
      els.progressText.textContent = 'Sin tareas';
    } else if (done === total) {
      els.progressText.textContent = '¡Todo hecho! ' + done + ' de ' + total + ' completadas (100%)';
    } else {
      els.progressText.textContent = done + ' de ' + total + ' completadas (' + pct + '%)';
    }
  }

  function pendingTasks(t) {
    return tasks
      .filter(function (x) { return !x.done && x.date < t; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }

  function renderPending(t) {
    var list = currentDay === t ? pendingTasks(t) : [];
    els.pending.hidden = list.length === 0;
    els.pendingList.textContent = '';
    els.moveAll.hidden = list.length < 2;

    list.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'task';

      var span = document.createElement('span');
      span.className = 'task-text';
      span.textContent = task.text;
      li.appendChild(span);

      var date = document.createElement('span');
      date.className = 'task-date';
      date.textContent = shortDate(task.date);
      li.appendChild(date);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'small-btn';
      btn.textContent = 'Pasar a hoy';
      btn.setAttribute('aria-label', 'Pasar a hoy: ' + task.text);
      btn.addEventListener('click', function () {
        task.date = todayKey();
        save();
        render();
      });
      li.appendChild(btn);

      els.pendingList.appendChild(li);
    });
  }

  // ---------- Eventos ----------
  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = els.input.value.trim();
    if (!text) {
      els.input.value = '';
      els.input.classList.remove('shake');
      void els.input.offsetWidth; // reinicia la animación
      els.input.classList.add('shake');
      els.input.focus();
      return;
    }
    tasks.push({ id: newId(), text: text, done: false, date: currentDay, createdAt: Date.now() });
    save();
    els.input.value = '';
    render();
    els.input.focus();
  });

  els.input.addEventListener('animationend', function () {
    els.input.classList.remove('shake');
  });

  els.prev.addEventListener('click', function () { currentDay = addDays(currentDay, -1); render(); });
  els.next.addEventListener('click', function () { currentDay = addDays(currentDay, 1); render(); });
  els.today.addEventListener('click', function () { currentDay = todayKey(); render(); });

  els.moveAll.addEventListener('click', function () {
    var t = todayKey();
    pendingTasks(t).forEach(function (task) { task.date = t; });
    save();
    render();
  });

  // Si la pestaña queda abierta y cambia el día, refresca títulos y pendientes
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && editingId === null) render();
  });

  // Sincroniza si se edita en otra pestaña
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) { tasks = load(); render(); }
  });

  render();
})();
