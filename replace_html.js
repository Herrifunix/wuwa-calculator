const fs = require('fs');
let content = fs.readFileSync('cutlog.html', 'utf-8');
const searchHTML = `<div class="card">
      <div class="label" style="margin-bottom: 12px;">// AJOUTER RAPIDE</div>`;
if (content.includes(searchHTML)) {
  console.log("Success: The block is present.")
} else {
  console.log("Failure: The block is NOT present.")
}
