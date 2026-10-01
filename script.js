// PASTE YOUR NEW URL HERE
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkzh9zSqjYL3w7bujHdnQG1G7KRZHLsL8wBw6e-fHLJxGKtFAbWiHL7LOh32Uw621t/exec";

let allRecords = [];

async function init() {
  const resultsGrid = document.getElementById('resultsGrid');
  try {
    console.log("Fetching from:", APPS_SCRIPT_URL);
    const response = await fetch(APPS_SCRIPT_URL);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    allRecords = data.records || [];
    console.log("Loaded:", allRecords.length, "records");
    
    populateDropdowns();
    applyFilters();
  } catch (err) {
    resultsGrid.innerHTML = `<div class="empty-state">❌ ${err.message}</div>`;
    console.error(err);
  }
}

function populateDropdowns() {
  const professions = new Set();
  const genders = new Set();
  allRecords.forEach(r => {
    if (r.profession) professions.add(r.profession.toString().trim());
    if (r.gender) genders.add(r.gender.toString().trim());
  });

  const profSel = document.getElementById('professionFilter');
  const genSel = document.getElementById('genderFilter');
  
  profSel.innerHTML = '<option value="all">All Professions</option>';
  genSel.innerHTML = '<option value="all">All Genders</option>';
  
  [...professions].sort().forEach(p => profSel.add(new Option(p, p)));
  [...genders].sort().forEach(g => genSel.add(new Option(g, g)));
}

function getAgeBracket(age) {
  const a = parseInt(age, 10);
  if (isNaN(a)) return null;
  if (a >= 18 && a <= 20) return "18-20";
  if (a >= 21 && a <= 25) return "21-25";
  if (a >= 26 && a <= 30) return "26-30";
  if (a >= 31 && a <= 35) return "31-35";
  if (a >= 36 && a <= 40) return "36-40";
  if (a >= 41 && a <= 45) return "41-45";
  if (a >= 46 && a <= 50) return "46-50";
  if (a >= 51 && a <= 55) return "51-55";
  if (a >= 56 && a <= 60) return "56-60";
  if (a >= 61) return "61+";
  return null;
}

function applyFilters() {
  const ageVal = document.getElementById('ageFilter').value;
  const profVal = document.getElementById('professionFilter').value;
  const genderVal = document.getElementById('genderFilter').value;

  const filtered = allRecords.filter(r => {
    const ab = getAgeBracket(r.age);
    const pm = profVal === "all" || r.profession?.trim() === profVal;
    const gm = genderVal === "all" || r.gender?.trim() === genderVal;
    const am = ageVal === "all" || ab === ageVal;
    return am && pm && gm;
  });

  renderGrid(filtered);
}

function renderGrid(records) {
  const grid = document.getElementById('resultsGrid');
  if (!records.length) {
    grid.innerHTML = `<div class="empty-state">No matching records.</div>`;
    return;
  }
  grid.innerHTML = records.map(r => `
    <div class="card">
      <h3>${escapeHtml(r.name)}</h3>
      <div class="detail"><strong>Age:</strong> ${escapeHtml(String(r.age))}</div>
      <div class="detail"><strong>Profession:</strong> ${escapeHtml(r.profession)}</div>
      <div class="detail"><strong>Gender:</strong> ${escapeHtml(r.gender)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]||t));
}

init();
