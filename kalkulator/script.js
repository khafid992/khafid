// ============================================================
//  CALCULATOR STATE
// ============================================================
let expr     = '';
let justCalc = false;

function updateDisplay(val, exprStr) {
  document.getElementById('result').textContent = val;
  document.getElementById('expr').textContent   = exprStr || '';
}

// ============================================================
//  CALCULATOR INPUT
// ============================================================
function inputNum(n) {
  if (justCalc) { expr = ''; justCalc = false; }
  expr += n;
  updateDisplay(expr, '');
}

function inputDot() {
  if (justCalc) { expr = '0'; justCalc = false; }
  const parts = expr.split(/[+\-×÷%]/);
  const last  = parts[parts.length - 1];
  if (!last.includes('.')) { expr += '.'; updateDisplay(expr, ''); }
}

function inputOp(op) {
  justCalc = false;
  if (expr === '' && op !== '−') return;
  const last = expr.slice(-1);
  if (['+','−','×','÷','%'].includes(last)) expr = expr.slice(0,-1);
  expr += op;
  updateDisplay(expr, '');
}

function inputFunc(fn) {
  if (justCalc) { expr = ''; justCalc = false; }
  expr += fn + '(';
  updateDisplay(expr, '');
}

function toggleSign() {
  if (!expr || expr === '0') return;
  expr = expr.startsWith('−') ? expr.slice(1) : '−' + expr;
  updateDisplay(expr, '');
}

function clearAll() {
  expr = ''; justCalc = false;
  updateDisplay('0', '');
}

function clearOne() {
  expr = expr.slice(0, -1);
  updateDisplay(expr || '0', '');
}

function backspace() { clearOne(); }

// ============================================================
//  CALCULATE
// ============================================================
function calculate() {
  if (!expr) return;
  try {
    const saved = expr;
    let e = expr
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/−/g, '-')
      .replace(/sin\(/g, 'Math.sin(Math.PI/180*')
      .replace(/cos\(/g, 'Math.cos(Math.PI/180*')
      .replace(/tan\(/g, 'Math.tan(Math.PI/180*')
      .replace(/%/g, '/100');
    let result = Function('"use strict"; return (' + e + ')')();
    result = parseFloat(result.toFixed(10));
    updateDisplay(result, saved + ' =');
    expr = String(result);
    justCalc = true;
  } catch {
    updateDisplay('Error', '');
    expr = '';
  }
}

// Hitung from top input
function hitungKalimat() {
  const val = document.getElementById('math-input').value.trim();
  if (!val) return;
  expr = val
    .replace(/\//g,'÷')
    .replace(/\*/g,'×')
    .replace(/-/g,'−');
  calculate();
  document.getElementById('math-input').value = '';
}

// ============================================================
//  TAB SWITCH
// ============================================================
const PANELS = ['calc','currency','unit','soal'];

function switchTab(tab) {
  PANELS.forEach(p => {
    document.getElementById(p + '-panel').style.display = p === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
}

// ============================================================
//  CURRENCY CONVERTER
// ============================================================
const RATES = {
  IDR: 1,
  USD: 0.000062,
  EUR: 0.000057,
  GBP: 0.000049,
  JPY: 0.0094,
  SGD: 0.000083,
  MYR: 0.000290,
  AUD: 0.000095,
  CNY: 0.000449,
  KRW: 0.0846
};

function convertCurrency() {
  const amount = parseFloat(document.getElementById('cur-amount').value);
  const from   = document.getElementById('cur-from').value;
  const to     = document.getElementById('cur-to').value;
  const res    = document.getElementById('cur-result');
  if (isNaN(amount)) { res.textContent = 'Masukkan angka valid'; res.classList.add('show'); return; }
  const inIDR  = amount / RATES[from];
  const result = inIDR * RATES[to];
  res.textContent = `${amount.toLocaleString()} ${from} = ${result.toLocaleString('id-ID', {maximumFractionDigits: 4})} ${to}`;
  res.classList.add('show');
}

// ============================================================
//  UNIT CONVERTER
// ============================================================
const UNIT_CATEGORIES = {
  Panjang: {
    units: ['m','km','cm','mm','inch','feet','yard','mile'],
    toBase: { m:1, km:1000, cm:0.01, mm:0.001, inch:0.0254, feet:0.3048, yard:0.9144, mile:1609.344 }
  },
  Berat: {
    units: ['kg','g','mg','ton','lb','oz'],
    toBase: { kg:1, g:0.001, mg:0.000001, ton:1000, lb:0.4536, oz:0.02835 }
  },
  Suhu: {
    units: ['Celsius','Fahrenheit','Kelvin'],
    toBase: null // handled specially
  },
  Luas: {
    units: ['m²','km²','cm²','hectare','acre'],
    toBase: { 'm²':1, 'km²':1e6, 'cm²':0.0001, 'hectare':10000, 'acre':4046.86 }
  }
};

function onUnitCategoryChange() {
  const cat  = document.getElementById('unit-cat').value;
  const data = UNIT_CATEGORIES[cat];
  ['unit-from','unit-to'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = data.units.map(u => `<option value="${u}">${u}</option>`).join('');
  });
  document.getElementById('unit-to').selectedIndex = 1;
}

function convertUnit() {
  const cat    = document.getElementById('unit-cat').value;
  const amount = parseFloat(document.getElementById('unit-amount').value);
  const from   = document.getElementById('unit-from').value;
  const to     = document.getElementById('unit-to').value;
  const res    = document.getElementById('unit-result');
  if (isNaN(amount)) { res.textContent = 'Masukkan angka valid'; res.classList.add('show'); return; }

  let result;
  if (cat === 'Suhu') {
    let celsius;
    if (from === 'Celsius')    celsius = amount;
    else if (from === 'Fahrenheit') celsius = (amount - 32) * 5/9;
    else celsius = amount - 273.15;

    if (to === 'Celsius')      result = celsius;
    else if (to === 'Fahrenheit') result = celsius * 9/5 + 32;
    else result = celsius + 273.15;
  } else {
    const tb = UNIT_CATEGORIES[cat].toBase;
    result = (amount * tb[from]) / tb[to];
  }

  result = parseFloat(result.toFixed(6));
  res.textContent = `${amount} ${from} = ${result} ${to}`;
  res.classList.add('show');
}

// ============================================================
//  SOAL CERITA
// ============================================================
let soalType = 'penjumlahan';

function selectType(btn, type) {
  soalType = type;
  document.querySelectorAll('.soal-type-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function extractNumbers(text) {
  const matches = text.match(/\d+([.,]\d+)?/g);
  if (!matches) return [];
  return matches.map(n => parseFloat(n.replace(',','.')));
}

function solveSoal() {
  const text    = document.getElementById('soal-input').value.trim();
  const resDiv  = document.getElementById('soal-result');
  const resVal  = document.getElementById('res-val');
  const resStep = document.getElementById('res-step');
  if (!text) { alert('Masukkan soal cerita terlebih dahulu!'); return; }

  const nums = extractNumbers(text);
  if (nums.length < 2) {
    resVal.textContent  = '?';
    resStep.textContent = 'Tidak cukup angka terdeteksi.\nPastikan soal memiliki minimal 2 angka.';
    resDiv.classList.add('show');
    return;
  }

  let answer, steps;
  switch (soalType) {
    case 'penjumlahan':
      answer = nums.reduce((a,b) => a+b, 0);
      steps  = `${nums.join(' + ')} = ${answer}`; break;
    case 'pengurangan':
      answer = nums.reduce((a,b) => a-b);
      steps  = `${nums.join(' − ')} = ${answer}`; break;
    case 'perkalian':
      answer = nums.reduce((a,b) => a*b, 1);
      steps  = `${nums.join(' × ')} = ${answer}`; break;
    case 'pembagian':
      if (nums.slice(1).some(n => n === 0)) {
        resVal.textContent  = 'Error';
        resStep.textContent = 'Pembagian dengan nol tidak diperbolehkan.';
        resDiv.classList.add('show'); return;
      }
      answer = parseFloat(nums.reduce((a,b) => a/b).toFixed(6));
      steps  = `${nums.join(' ÷ ')} = ${answer}`; break;
  }

  resVal.textContent  = answer;
  resStep.textContent = `Langkah:\n${steps}\n\nAngka ditemukan: [${nums.join(', ')}]\nOperasi: ${soalType}`;
  resDiv.classList.add('show');
}

// ============================================================
//  ASISTEN (simple keyword-based helper)
// ============================================================
function tanyaAsisten() {
  const q   = document.getElementById('asisten-input').value.trim().toLowerCase();
  const res = document.getElementById('asisten-result');
  if (!q) return;

  let jawaban = '';

  if (q.includes('sin') || q.includes('cos') || q.includes('tan')) {
    jawaban = '📐 Trigonometri: gunakan tombol sin/cos/tan lalu masukkan sudut dalam derajat. Contoh: sin(30) = 0.5';
  } else if (q.includes('persen') || q.includes('%')) {
    jawaban = '💡 Persen: ketik angka lalu tekan tombol %. Contoh: 200 % 15 = 30 (15% dari 200).';
  } else if (q.includes('konversi') || q.includes('mata uang') || q.includes('currency')) {
    jawaban = '💱 Klik tab CUR untuk konversi mata uang (USD, EUR, IDR, JPY, dll).';
  } else if (q.includes('satuan') || q.includes('unit') || q.includes('panjang') || q.includes('berat')) {
    jawaban = '📏 Klik tab UNIT untuk konversi satuan: panjang, berat, suhu, dan luas.';
  } else if (q.includes('soal cerita')) {
    jawaban = '📖 Klik tab "Soal Cerita", pilih jenis operasi, ketik soal, lalu klik Selesaikan.';
  } else if (q.includes('akar') || q.includes('sqrt')) {
    jawaban = '√ Untuk akar: ketik Math.sqrt(angka) di input atas, lalu klik Hitung. Contoh: Math.sqrt(144) = 12.';
  } else if (q.includes('pangkat') || q.includes('kuadrat')) {
    jawaban = '🔢 Untuk pangkat: ketik angka**pangkat di input atas. Contoh: 2**10 = 1024.';
  } else if (q.includes('halo') || q.includes('hi') || q.includes('hey')) {
    jawaban = '👋 Halo! Saya Asisten Kalkulator. Tanya tentang cara pakai fitur, konversi, trigonometri, soal cerita, dan lainnya!';
  } else {
    jawaban = `🤔 Saya belum tahu jawaban untuk "${q}". Coba tanya tentang: konversi, trigonometri, persen, soal cerita, akar, atau pangkat.`;
  }

  res.textContent = jawaban;
  res.classList.add('show');
  document.getElementById('asisten-input').value = '';
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('math-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') hitungKalimat();
  });
  document.getElementById('asisten-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') tanyaAsisten();
  });
  // init unit dropdowns
  onUnitCategoryChange();
});