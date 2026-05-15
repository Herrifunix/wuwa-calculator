const fs = require('fs');
let content = fs.readFileSync('cutlog.html', 'utf-8');
const start = content.indexOf('// ENTRA');
let sPos = content.lastIndexOf('<div class="card">', start);
const end = content.indexOf('// POIDS</div>');
let ePos = content.lastIndexOf('<div class="card">', end);
if (sPos > -1 && ePos > -1) {
  content = content.substring(0, sPos) + 
  '    <div class="card" id="workoutsContainer">\n      <div class="label" style="margin-bottom: 12px;">// ENTRAÎNEMENT (PROGRAMME COMPLET)</div>\n      <!-- Injected by JS -->\n    </div>\n\n' + 
  content.substring(ePos);
  
  content = content.replace(/\? FAIT/g, '✓ FAIT');
  content = content.replace(/d\?faut/g, 'défaut');
  content = content.replace(/ENTRA\?NEMENT/g, 'ENTRAÎNEMENT');
  content = content.replace(/reps\/s\?ries/g, 'reps/séries');
  
  fs.writeFileSync('cutlog.html', content);
  console.log("Replaced markup");
} else {
  console.log("Not found");
}
