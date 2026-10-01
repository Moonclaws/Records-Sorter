const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwi6sybA5YwkSlXeB17bCRIfI6SVfAr6kDBPdV61Ox8X_49eCmMR_6StO1CMFVbDKIsZA/exec";

let allRecords = [];

async function init() {
  const resultsGrid = document.getElementById('resultsGrid');
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    const data = await response.json();
    allRecords = data.records;
    
    populateDropdowns();
    applyFilters(); // Initial render
  } catch (err) {
    resultsGrid.innerHTML = `<div class="empty-state">Error loading data. Check console.</div>`;
    console.error(err);
  }
}

function populateDropdowns() {
  const professions = new Set();
  const genders = new Set();

  allRecords.forEach(record => {
    if (record.profession) professions.add(record.profession.trim());
    if (record.gender) genders.add(record.gender.trim());
  });

  const profSelect = document.getElementById('professionFilter');
  [...professions].sort().forEach(prof => {
    profSelect.add(new Option(prof, prof));
  });

  const genderSelect = document.getElementById('genderFilter');
  [...genders].sort().forEach(gender => {
    genderSelect.add(new Option(gender, gender));
  });
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

  const filtered = allRecords.filter(record => {
    // Check Age
    let ageMatch = true;
    if (ageVal !== "all") {
      ageMatch = getAgeBracket(record.age) === ageVal;
    }

    // Check Profession
    let profMatch = true;
    if (profVal !== "all") {
      profMatch = record.profession.trim() === profVal;
    }

    // Check Gender
    let genderMatch = true;
    if (genderVal !== "all") {
      genderMatch = record.gender.trim() === genderVal;
    }

    return ageMatch && profMatch && genderMatch;
  });

  renderGrid(filtered);
}

function renderGrid(records) {
  const resultsGrid = document.getElementById('resultsGrid');
  
  if (records.length === 0) {
    resultsGrid.innerHTML = `<div class="empty-state">No records match the selected filters.</div>`;
    return;
  }

  resultsGrid.innerHTML = records.map(record => `
    <div class="card">
      <h3>${escapeHtml(record.name)}</h3>
      <div class="detail"><strong>Age:</strong> ${escapeHtml(record.age.toString())}</div>
      <div class="detail"><strong>Profession:</strong> ${escapeHtml(record.profession)}</div>
      <div class="detail"><strong>Gender:</strong> ${escapeHtml(record.gender)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Run on load
init();
