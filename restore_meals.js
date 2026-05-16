const fs = require('fs');
let content = fs.readFileSync('cutlog.html', 'utf-8');
const anchor = '<div id="protHint" class="progress-hint">180g manquants</div>';
const mealsHtml = `
      </div>
    </div>
    <div class="card">
      <div class="label" style="margin-bottom: 12px;">// AJOUTER RAPIDE</div>
      <div class="meal-grid" id="mealGrid"></div>
      
      <div class="custom-section">
        <div class="custom-row">
          <input type="text" id="customName" placeholder="Nom (opt)">
          <input type="number" id="customCal" placeholder="Kcal" style="flex:0 0 60px">
          <input type="number" id="customProt" placeholder="Prot" style="flex:0 0 60px">
          <button class="btn-primary" onclick="addCustom()">LOG</button>
        </div>
        <div style="margin-top:8px">
          <button class="meal-btn" style="width: 100%; border-color: rgba(248,113,113,0.3); text-align: center; display: block;" onclick="addMeal({id: 'tresor', name:'Tresor', emoji:'bol', cal:480, prot:25})">
            <div style="font-size:12px;">Cheat: Bol Tresor (480 kcal ? 25g)</div>
          </button>
        </div>
      </div>
    </div>

    <div id="journalCard" class="card" style="display: none;">
      <div class="label" style="margin-bottom: 12px;">// JOURNAL <span id="journalCount"></span></div>
      <div id="journalList"></div>
`;

if (content.indexOf('id="mealGrid"') === -1) {
    // Only replace the anchor up to the container
    let p = content.indexOf(anchor);
    if(p !== -1) {
       let p2 = content.indexOf('</div>', p + anchor.length);
       let p3 = content.indexOf('</div>', p2 + 6);
       content = content.substring(0, p) + anchor + mealsHtml + content.substring(p3 + 6);
       fs.writeFileSync('cutlog.html', content);
       console.log("Restored meals");
    } else {
       console.log("Anchor not found");
    }
} else {
    console.log("Meals already present");
}
