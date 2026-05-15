const fs = require('fs');
let content = fs.readFileSync('cutlog.html', 'utf-8');

const workoutHtmlNew = `    <div class="card" id="workoutsContainer">
      <div class="label" style="margin-bottom: 12px;">// ENTRA?NEMENT (PROGRAMME COMPLET)</div>
      <!-- Injected by JS -->
    </div>`;

content = content.replace(
  /    <div class="card">\s*<div class="label" style="margin-bottom: 12px;">\/\/ ENTRA?NEMENT<\/div>.*?(?=    <div class="card">\s*<div class="label" style="margin-bottom: 12px;">\/\/ POIDS<\/div>)/s,
  workoutHtmlNew + '\n\n'
);

content = content.replace(
  /    <div class="card">\s*<div class="label" style="margin-bottom: 12px;">\/\/ ENTRA??NEMENT<\/div>.*?(?=    <div class="card">\s*<div class="label" style="margin-bottom: 12px;">\/\/ POIDS<\/div>)/s,
  workoutHtmlNew + '\n\n'
);

const renderWorkoutNew = `
  function renderWorkout() {
    const container = document.getElementById('workoutsContainer');
    if (!container) return;
    let html = '<div class="label" style="margin-bottom: 12px;">// ENTRA?NEMENT (PROGRAMME COMPLET)</div>';
    
    const daysOrder = [1, 2, 3, 4, 5, 6, 0];
    const dayNames = {1:'LUNDI', 2:'MARDI', 3:'MERCREDI', 4:'JEUDI', 5:'VENDREDI', 6:'SAMEDI', 0:'DIMANCHE'};
    const todayDow = new Date().getDay();

    daysOrder.forEach(dow => {
      const def = DEFAULT_EXOS[dow];
      if (!def) return;
      
      const dayName = dayNames[dow];
      const isToday = dow === todayDow ? ' (AUJOURD\\\'HUI)' : '';
      const isWorkingOut = today.workoutDoneObj && today.workoutDoneObj[dow];

      html += \`
        <div class="workout-header" style="margin-top: 16px;">
          <div class="workout-info">
            <div class="display workout-title">
              <span class="workout-icon">\${def.icon}</span><span class="workoutName">\${dayName} - \${def.title}\${isToday}</span>
            </div>
            <div class="workout-desc">\${def.desc}</div>
          </div>
        </div>
        <div class="exo-list" id="exoList-\${dow}"></div>
        <div class="workout-footer">
          <div class="workout-note">\${def.note}</div>
          \${def.items && def.items.length > 0 ? \\\`<button class="reset-btn" onclick="resetExos(\${dow})" title="Restaurer reps/s?ries par d?faut">? d?faut</button>\\\` : ''}
          <button class="workout-btn \${isWorkingOut ? 'done' : ''}" onclick="toggleWorkout(\${dow})">\${isWorkingOut ? '? FAIT' : 'MARQUER'}</button>
        </div>
      \`;
    });
    container.innerHTML = html;

    daysOrder.forEach(dow => {
      const exos = getExos(dow);
      const list = document.getElementById(\`exoList-\${dow}\`);
      if (!list) return;
      exos.forEach((ex, idx) => {
        const code = dow + "-" + idx;
        let done = false;
        // Migration of ex check array from prev version
        if (today.exosChecked && (today.exosChecked.includes(code) || (dow === todayDow && today.exosChecked.includes(idx)))) {
            done = true;
        }
        const row = document.createElement('div');
        row.className = 'exo-row' + (done ? ' done' : '');
        row.innerHTML = \`
          <div class="exo-check">\${done ? '?' : ''}</div>
          <div class="exo-name">\${ex.name}</div>
          <div class="exo-reps">
            <input type="text" class="exo-input sets-input" value="\${ex.sets}" data-idx="\${idx}" data-field="sets" data-dow="\${dow}">
            <span>?</span>
            <input type="text" class="exo-input reps-input" value="\${ex.reps}" data-idx="\${idx}" data-field="reps" data-dow="\${dow}">
          </div>
        \`;
        row.onclick = (e) => {
          if (e.target.tagName === 'INPUT') return;
          toggleExo(idx, dow);
        };
        list.appendChild(row);
      });
      list.querySelectorAll('.exo-input').forEach(inp => {
        inp.addEventListener('input', (e) => editExo(parseInt(e.target.dataset.idx), e.target.dataset.field, e.target.value, parseInt(e.target.dataset.dow)));
        inp.addEventListener('click', e => e.stopPropagation());
      });
    });
  }

  function toggleWorkout(dow) {
    if (!today.workoutDoneObj) today.workoutDoneObj = {};
    today.workoutDoneObj[dow] = !today.workoutDoneObj[dow];
    saveToday();
    renderWorkout();
  }

  function toggleExo(idx, dow) {
    let code = dow + '-' + idx;
    if (!today.exosChecked) today.exosChecked = [];
    if (today.exosChecked.includes(code)) {
      today.exosChecked = today.exosChecked.filter(i => i !== code);
    } else {
      today.exosChecked.push(code);
    }
    saveToday(); renderWorkout();
  }

  function editExo(idx, field, value, dow) {
    if (!customExos[dow]) customExos[dow] = JSON.parse(JSON.stringify(DEFAULT_EXOS[dow].items));
    if (customExos[dow][idx]) {
      customExos[dow][idx][field] = value;
      saveCustomExos();
    }
  }

  function resetExos(dow) {
    if (!customExos[dow]) return;
    if (!confirm("Restaurer reps/s?ries par d?faut pour ce jour ?")) return;
    delete customExos[dow];
    saveCustomExos();
    renderWorkout();
  }
`;

content = content.replace(/function renderWorkout\(\).*?function renderWeight\(\)/s, renderWorkoutNew + "\n  function renderWeight()");
content = content.replace(/function toggleWorkout\(\) {.*?function logWeight\(\)/s, 'function logWeight()');

fs.writeFileSync('cutlog.html', content);
console.log('Done!');
