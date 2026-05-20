const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new AudioCtx();
    return audioCtx;
}

function playSound(type) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = 0.08;

        switch (type) {
            case 'number':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600 + Math.random() * 400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.08);
                break;
            case 'operator':
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.12);
                break;
            case 'equals':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.2);
                setTimeout(() => {
                    const o2 = ctx.createOscillator();
                    const g2 = ctx.createGain();
                    o2.connect(g2);
                    g2.connect(ctx.destination);
                    o2.type = 'sine';
                    o2.frequency.setValueAtTime(800, ctx.currentTime);
                    o2.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
                    g2.gain.value = 0.06;
                    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                    o2.start(ctx.currentTime);
                    o2.stop(ctx.currentTime + 0.15);
                }, 100);
                break;
            case 'clear':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.18);
                break;
            case 'delete':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.1);
                break;
            default:
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.06);
        }
    } catch (e) { }
}

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('.btn-calc');

let currentInput = '';
let expression = '';
let result = '0';
let justEvaluated = false;

function updateDisplay() {
    resultEl.textContent = result || '0';
    expressionEl.textContent = expression;
}

function evaluate(expr) {
    try {
        const sanitized = expr.replace(/&divide;/g, '/').replace(/&times;/g, '*').replace(/\u00f7/g, '/').replace(/\u00d7/g, '*');
        const res = Function('"use strict"; return (' + sanitized + ')')();
        return Number.isFinite(res) ? String(res) : 'Error';
    } catch {
        return 'Error';
    }
}

buttons.forEach(btn => {
    btn.addEventListener('click', function () {
        const val = this.dataset.val;
        const cls = this.className;

        this.classList.remove('wiggle', 'pop');
        void this.offsetWidth;
        if (val === '=') {
            this.classList.add('pop');
            playSound('equals');
        } else if (val === 'C') {
            this.classList.add('wiggle');
            playSound('clear');
        } else if (val === 'DEL') {
            this.classList.add('wiggle');
            playSound('delete');
        } else if (cls.includes('operator')) {
            this.classList.add('pop');
            playSound('operator');
        } else {
            this.classList.add('pop');
            playSound('number');
        }

        if (val === 'C') {
            currentInput = '';
            expression = '';
            result = '0';
            justEvaluated = false;
            updateDisplay();
            return;
        }

        if (val === 'DEL') {
            if (justEvaluated) return;
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                expression = expression.slice(0, -1);
            }
            result = currentInput || '0';
            updateDisplay();
            return;
        }

        if (val === '=') {
            if (expression) {
                const ans = evaluate(expression);
                result = ans;
                expression = expression + ' =';
                justEvaluated = true;
                updateDisplay();
            }
            return;
        }

        if (justEvaluated) {
            if (/^[0-9.]$/.test(val)) {
                currentInput = val;
                expression = val;
                result = val;
            } else if (['+', '-', '*', '/', '%'].includes(val)) {
                const lastResult = result;
                currentInput = val;
                expression = lastResult + ' ' + val;
                result = lastResult + ' ' + val;
            }
            justEvaluated = false;
            updateDisplay();
            return;
        }

        if (['+', '-', '*', '/', '%'].includes(val)) {
            if (currentInput === '' && expression === '') return;
            const lastChar = expression.slice(-1);
            if (['+', '-', '*', '/', '%'].includes(lastChar)) {
                expression = expression.slice(0, -1) + val;
            } else {
                expression += ' ' + val;
            }
            currentInput = '';
            result = expression;
            updateDisplay();
            return;
        }

        if (val === '.') {
            if (currentInput.includes('.')) return;
            if (currentInput === '') {
                currentInput = '0.';
                expression += '0.';
            } else {
                currentInput += '.';
                expression += '.';
            }
            result = expression;
            updateDisplay();
            return;
        }

        currentInput += val;
        expression += val;
        result = expression;
        updateDisplay();
    });
});

document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const keyMap = {
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
        '.': '.', '+': '+', '-': '-', '*': '*', '/': '/',
        '%': '%', 'Enter': '=', '=': '=', 'Backspace': 'DEL',
        'Escape': 'C', 'Delete': 'C'
    };
    const mapped = keyMap[e.key];
    if (mapped) {
        e.preventDefault();
        const btn = document.querySelector(`.btn-calc[data-val="${mapped}"]`);
        if (btn) btn.click();
    }
});

updateDisplay();

const convData = {
    time: {
        units: { ms: 0.001, s: 1, min: 60, hr: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 },
        labels: { ms: 'ms', s: 'sec', min: 'min', hr: 'hr', day: 'day', week: 'wk', month: 'mo', year: 'yr' }
    },
    length: {
        units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
        labels: { mm: 'mm', cm: 'cm', m: 'm', km: 'km', in: 'in', ft: 'ft', yd: 'yd', mi: 'mi' }
    },
    weight: {
        units: { mg: 0.000001, g: 0.001, kg: 1, oz: 0.0283495, lb: 0.453592 },
        labels: { mg: 'mg', g: 'g', kg: 'kg', oz: 'oz', lb: 'lb' }
    },
    temperature: {
        units: { C: 'c', F: 'f', K: 'k' },
        labels: { C: '°C', F: '°F', K: 'K' },
        custom: true
    },
    volume: {
        units: { mL: 0.001, L: 1, gal: 3.78541, floz: 0.0295735, cup: 0.236588 },
        labels: { mL: 'mL', L: 'L', gal: 'gal', floz: 'fl oz', cup: 'cup' }
    },
    area: {
        units: { cm2: 0.0001, m2: 1, km2: 1000000, in2: 0.00064516, ft2: 0.092903 },
        labels: { cm2: 'cm²', m2: 'm²', km2: 'km²', in2: 'in²', ft2: 'ft²' }
    }
};

let convCategory = 'time';
let convInputVal = '';

const convInput = document.getElementById('convInput');
const convResult = document.getElementById('convResult');
const convFrom = document.getElementById('convFrom');
const convTo = document.getElementById('convTo');
const timeSubtabs = document.getElementById('timeSubtabs');
const convDurationSection = document.getElementById('convDurationSection');
const convDateSection = document.getElementById('convDateSection');
const convDisplayDuration = document.getElementById('convDisplayDuration');

function populateUnits(cat) {
    const data = convData[cat];
    convFrom.innerHTML = '';
    convTo.innerHTML = '';
    const keys = Object.keys(data.units);
    keys.forEach((k, i) => {
        convFrom.innerHTML += `<option value="${k}">${data.labels[k]}</option>`;
        convTo.innerHTML += `<option value="${k}">${data.labels[k]}</option>`;
    });
    convTo.value = keys.length > 1 ? keys[1] : keys[0];
}

function isTimeCategory() {
    return convCategory === 'time';
}

function updateTimeSubtabVisibility() {
    const showDate = isTimeCategory() && document.querySelector('.conv-subtab.active').dataset.sub === 'date';
    timeSubtabs.style.display = isTimeCategory() ? 'flex' : 'none';
    convDurationSection.style.display = showDate ? 'none' : 'block';
    convDateSection.classList.toggle('active', showDate);
    convDisplayDuration.style.display = showDate ? 'none' : 'block';
}

function convert() {
    if (isTimeCategory() && document.querySelector('.conv-subtab.active').dataset.sub === 'date') return;
    const val = parseFloat(convInput.value);
    if (isNaN(val)) { convResult.textContent = '0'; return; }
    const data = convData[convCategory];
    const fromUnit = convFrom.value;
    const toUnit = convTo.value;

    if (data.custom) {
        let celsius;
        if (fromUnit === 'C') celsius = val;
        else if (fromUnit === 'F') celsius = (val - 32) * 5 / 9;
        else celsius = val - 273.15;

        let res;
        if (toUnit === 'C') res = celsius;
        else if (toUnit === 'F') res = celsius * 9 / 5 + 32;
        else res = celsius + 273.15;

        convResult.textContent = parseFloat(res.toFixed(6)).toString();
    } else {
        const baseVal = val * data.units[fromUnit];
        const res = baseVal / data.units[toUnit];
        convResult.textContent = parseFloat(res.toFixed(10)).toString();
    }
}

populateUnits('time');

convInput.addEventListener('input', convert);
convFrom.addEventListener('change', convert);
convTo.addEventListener('change', convert);

document.querySelectorAll('.conv-cat-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.conv-cat-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        convCategory = this.dataset.cat;
        populateUnits(convCategory);
        updateTimeSubtabVisibility();
        if (!(isTimeCategory() && document.querySelector('.conv-subtab.active').dataset.sub === 'date')) {
            convert();
        }
    });
});

document.getElementById('convSwap').addEventListener('click', function () {
    const tmp = convFrom.value;
    convFrom.value = convTo.value;
    convTo.value = tmp;
    convert();
    this.style.transform = 'rotate(180deg)';
    setTimeout(() => this.style.transform = '', 200);
});

document.querySelectorAll('[data-conv]').forEach(btn => {
    btn.addEventListener('click', function () {
        const val = this.dataset.conv;

        const activeDateInput = document.querySelector('#convDateSection.active .date-input:focus, #convDateSection.active input.date-input:not(select)');
        if (document.getElementById('convDateSection').classList.contains('active') && activeDateInput && activeDateInput.tagName === 'INPUT') {
            if (val === 'C') {
                activeDateInput.value = '';
            } else if (val === 'DEL') {
                activeDateInput.value = activeDateInput.value.slice(0, -1);
            } else if (val === '.') {
                if (!activeDateInput.value.includes('.')) activeDateInput.value += '.';
            } else if (val === '=') {
            } else {
                activeDateInput.value += val;
            }
            activeDateInput.dispatchEvent(new Event('input', { bubbles: true }));
            activeDateInput.focus();
            return;
        }

        if (val === 'C') {
            convInput.value = '';
            convInputVal = '';
            convResult.textContent = '0';
        } else if (val === 'DEL') {
            convInput.value = convInput.value.slice(0, -1);
            convert();
        } else if (val === '=') {
            convert();
        } else if (val === '.') {
            if (!convInput.value.includes('.')) {
                convInput.value += '.';
                convert();
            }
        } else {
            convInput.value += val;
            convert();
        }
    });
});

document.querySelectorAll('.conv-subtab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.conv-subtab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        updateTimeSubtabVisibility();
    });
});

const hijriMonthNames = ['Muharram', 'Safar', "Rabi' I", "Rabi' II", 'Jumada I', 'Jumada II', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu'l-Qi'dah", "Dhu'l-Hijjah"];

function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function gregorianMonthLength(y, m) {
    return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

function isValidGregorianDate(y, m, d) {
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
    if (y < 1 || m < 1 || m > 12 || d < 1) return false;
    return d <= gregorianMonthLength(y, m);
}

function isIslamicLeapYear(year) {
    return (year * 11 + 14) % 30 < 11;
}

function islamicMonthLength(year, month) {
    if (month <= 11) return month % 2 === 1 ? 30 : 29;
    return isIslamicLeapYear(year) ? 30 : 29;
}

function isValidHijriDate(y, m, d) {
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
    if (y < 1 || m < 1 || m > 12 || d < 1) return false;
    return d <= islamicMonthLength(y, m);
}

function gregorianToJD(y, m, d) {
    if (m < 3) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

function jdToGregorian(jd) {
    const z = Math.floor(jd + 0.5);
    const w = Math.floor((z - 1867216.25) / 36524.25);
    const x = Math.floor(w / 4);
    const a = z + 1 + w - x;
    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);
    const day = Math.floor(b - d - Math.floor(30.6001 * e));
    let month = e < 14 ? e - 1 : e - 13;
    let year = month > 2 ? c - 4716 : c - 4715;
    return { year, month, day };
}

function islamicToJD(year, month, day) {
    const epoch = 1948439.5;
    let days = 0;
    for (let y = 1; y < year; y++) days += isIslamicLeapYear(y) ? 355 : 354;
    for (let m = 1; m < month; m++) days += islamicMonthLength(year, m);
    return epoch + days + day - 1;
}

function jdToIslamic(jd) {
    const epoch = 1948439.5;
    let days = jd - epoch;
    if (days < 0) return null;
    let year = Math.floor(days / 354.367) + 1;
    let totalDays = 0;
    for (let y = 1; y < year; y++) totalDays += isIslamicLeapYear(y) ? 355 : 354;
    while (totalDays > days) {
        year--;
        totalDays -= isIslamicLeapYear(year) ? 355 : 354;
    }
    while (totalDays + (isIslamicLeapYear(year) ? 355 : 354) <= days) {
        totalDays += isIslamicLeapYear(year) ? 355 : 354;
        year++;
    }
    let remaining = days - totalDays;
    let month = 1;
    while (month <= 12) {
        const mLen = islamicMonthLength(year, month);
        if (remaining < mLen) break;
        remaining -= mLen;
        month++;
    }
    return { year, month, day: Math.floor(remaining) + 1 };
}

function updateHijriDayMax() {
    const y = parseInt(document.getElementById('hijriYear').value);
    const m = parseInt(document.getElementById('hijriMonth').value);
    if (y && m) {
        document.getElementById('hijriDay').max = islamicMonthLength(y, m);
    }
}

function convertDate() {
    const fromType = document.getElementById('dateFromType').value;
    const toType = document.getElementById('dateToType').value;
    const resultEl = document.getElementById('dateResult');

    if (fromType === 'gregorian') {
        const d = parseInt(document.getElementById('dateDay').value);
        const m = parseInt(document.getElementById('dateMonth').value);
        const y = parseInt(document.getElementById('dateYear').value);

        if (!isValidGregorianDate(y, m, d)) {
            if (y && m && d) resultEl.textContent = 'Invalid date';
            else resultEl.textContent = '--';
            return;
        }
        const jd = gregorianToJD(y, m, d);
        if (toType === 'hijri') {
            const h = jdToIslamic(jd);
            if (!h) { resultEl.textContent = 'Out of range'; return; }
            resultEl.textContent = `${h.day} ${hijriMonthNames[h.month - 1]} ${h.year} AH`;
            resultEl.className = 'date-result-value hijri';
        }
    } else {
        const d = parseInt(document.getElementById('hijriDay').value);
        const m = parseInt(document.getElementById('hijriMonth').value);
        const y = parseInt(document.getElementById('hijriYear').value);

        updateHijriDayMax();

        if (!isValidHijriDate(y, m, d)) {
            if (y && m && d) resultEl.textContent = 'Invalid date';
            else resultEl.textContent = '--';
            return;
        }
        if (toType === 'gregorian') {
            const jd = islamicToJD(y, m, d);
            if (jd < 1948439.5) { resultEl.textContent = 'Out of range'; return; }
            const g = jdToGregorian(jd);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            resultEl.textContent = `${g.day} ${months[g.month - 1]} ${g.year} CE`;
            resultEl.className = 'date-result-value gregorian';
        }
    }
}

function validateNumericInput(e, min, max) {
    const input = e.target;
    let val = input.value.replace(/\D/g, '');
    if (val === '') { input.value = ''; return; }
    let num = parseInt(val, 10);
    if (num < min) num = min;
    if (max !== null && num > max) num = max;
    input.value = num.toString();
}

document.getElementById('dateDay').addEventListener('input', function (e) {
    const y = parseInt(document.getElementById('dateYear').value);
    const m = parseInt(document.getElementById('dateMonth').value);
    const maxDay = (y && m && isValidGregorianDate(y, m, 1)) ? gregorianMonthLength(y, m) : 31;
    validateNumericInput(e, 1, maxDay);
    convertDate();
});
document.getElementById('dateMonth').addEventListener('input', function (e) {
    validateNumericInput(e, 1, 12);
    const y = parseInt(document.getElementById('dateYear').value);
    const m = parseInt(this.value);
    if (y && m) {
        const maxDay = gregorianMonthLength(y, m);
        const dayInput = document.getElementById('dateDay');
        if (parseInt(dayInput.value) > maxDay) {
            dayInput.value = maxDay.toString();
        }
    }
    convertDate();
});
document.getElementById('dateYear').addEventListener('input', function (e) {
    validateNumericInput(e, 1, null);
    const y = parseInt(this.value);
    const m = parseInt(document.getElementById('dateMonth').value);
    const dayInput = document.getElementById('dateDay');
    if (y && m) {
        const maxDay = gregorianMonthLength(y, m);
        if (parseInt(dayInput.value) > maxDay) {
            dayInput.value = maxDay.toString();
        }
    }
    convertDate();
});
document.getElementById('hijriDay').addEventListener('input', function (e) {
    const y = parseInt(document.getElementById('hijriYear').value);
    const m = parseInt(document.getElementById('hijriMonth').value);
    const maxDay = (y && m) ? islamicMonthLength(y, m) : 30;
    validateNumericInput(e, 1, maxDay);
    convertDate();
});
document.getElementById('hijriMonth').addEventListener('change', function () {
    const y = parseInt(document.getElementById('hijriYear').value);
    const m = parseInt(this.value);
    const dayInput = document.getElementById('hijriDay');
    if (y && m) {
        const maxDay = islamicMonthLength(y, m);
        if (parseInt(dayInput.value) > maxDay) {
            dayInput.value = maxDay.toString();
        }
    }
    convertDate();
});
document.getElementById('hijriYear').addEventListener('input', function (e) {
    validateNumericInput(e, 1, null);
    const y = parseInt(this.value);
    const m = parseInt(document.getElementById('hijriMonth').value);
    const dayInput = document.getElementById('hijriDay');
    if (y && m) {
        const maxDay = islamicMonthLength(y, m);
        if (parseInt(dayInput.value) > maxDay) {
            dayInput.value = maxDay.toString();
        }
    }
    convertDate();
});

document.getElementById('dateFromType').addEventListener('change', function () {
    const toType = document.getElementById('dateToType');
    toType.value = this.value === 'gregorian' ? 'hijri' : 'gregorian';
    document.getElementById('gregorianInputs').style.display = this.value === 'gregorian' ? 'flex' : 'none';
    document.getElementById('hijriInputs').style.display = this.value === 'hijri' ? 'flex' : 'none';
    convertDate();
});

document.getElementById('dateToType').addEventListener('change', function () {
    const fromType = document.getElementById('dateFromType');
    fromType.value = this.value === 'gregorian' ? 'hijri' : 'gregorian';
    document.getElementById('gregorianInputs').style.display = fromType.value === 'gregorian' ? 'flex' : 'none';
    document.getElementById('hijriInputs').style.display = fromType.value === 'hijri' ? 'flex' : 'none';
    convertDate();
});

document.getElementById('dateTypeSwap').addEventListener('click', function () {
    const fromType = document.getElementById('dateFromType');
    const toType = document.getElementById('dateToType');
    const tmp = fromType.value;
    fromType.value = toType.value;
    toType.value = tmp;
    document.getElementById('gregorianInputs').style.display = fromType.value === 'gregorian' ? 'flex' : 'none';
    document.getElementById('hijriInputs').style.display = fromType.value === 'hijri' ? 'flex' : 'none';
    convertDate();
    this.style.transform = 'rotate(180deg)';
    setTimeout(() => this.style.transform = '', 200);
});

updateTimeSubtabVisibility();

document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.getElementById('panel-' + this.dataset.mode).classList.add('active');
    });
});

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '\u2600' : '\uD83C\uDF19';

themeToggle.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    this.textContent = next === 'dark' ? '\u2600' : '\uD83C\uDF19';
});
