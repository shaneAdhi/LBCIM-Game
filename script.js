let posX = 0;
let direction = 1;
let speed = 5;
let animationId = null;
let attempts = 0;
let bestOffset = Infinity;

const phone = document.getElementById('moving-phone');
const viewfinder = document.getElementById('viewfinder');
const arena = document.getElementById('game-arena');
const scanSound = document.getElementById('snd-scan');

// TODO: replace with your deployed Google Apps Script Web App URL.
const GOOGLE_SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz5bIYz46rwQo3O8vpOnaHWqyqiRSd5CMPdKLWrpDlG2AOWYvxYlC9Vf3v8V1CIvAcqMw/exec';

window.onload = () => {
    updateLeaderboard();
    const logos = document.querySelectorAll('img[src="unnamed.jpg"]');
    logos.forEach(img => { img.src = "unnamed.jpg?v=" + Math.random(); });
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    phone.style.display = (id === 'screen-game') ? 'block' : 'none';
}

document.getElementById('btn-start').onclick = () => {
    const name = document.getElementById('player-name').value.trim();
    const nic = document.getElementById('player-nic').value.trim();
    const epf = document.getElementById('player-epf').value.trim();
    if (!name || !nic || !epf) return alert("Please enter Name, NIC, and EPF.");

    // Unmute for browser
    scanSound.play().then(() => { scanSound.pause(); scanSound.currentTime = 0; }).catch(() => {});

    const played = JSON.parse(localStorage.getItem('cimPlayed')) || [];
    if (played.includes(epf)) return alert("This EPF has already played!");

    window.currentPlayer = name;
    window.currentNIC = nic;
    window.currentEPF = epf;
    attempts = 0;
    bestOffset = Infinity;
    startGame();
};

function startGame() {
    showScreen('screen-game');
    posX = 0;
    direction = 1;
    speed = 5 + (attempts * 4);
    if (animationId) cancelAnimationFrame(animationId);
    update();
}

function update() {
    const maxPath = arena.clientWidth - phone.offsetWidth;
    if (posX >= maxPath) { posX = maxPath; direction = -1; }
    else if (posX <= 0) { posX = 0; direction = 1; }

    posX += speed * direction;
    phone.style.left = posX + "px";

    const offset = Math.abs((arena.clientWidth / 2) - (posX + (phone.offsetWidth / 2)));
    if (offset < 35) viewfinder.classList.add('aligned');
    else viewfinder.classList.remove('aligned');

    animationId = requestAnimationFrame(update);
}

document.getElementById('btn-stop').onclick = () => {
    cancelAnimationFrame(animationId);
    const offset = Math.abs((arena.clientWidth / 2) - (posX + (phone.offsetWidth / 2)));
    
    scanSound.currentTime = 0;
    scanSound.play().catch(() => {});

    attempts++;
    if (offset < bestOffset) bestOffset = offset;

    if (attempts < 2) {
        alert("Attempt 1: " + offset.toFixed(0) + "px. Get ready for Attempt 2!");
        startGame();
    } else {
        finishGame(bestOffset);
    }
};

function finishGame(score) {
    showScreen('screen-result');
    document.getElementById('result-score').innerText = score.toFixed(0);
    
    let lb = JSON.parse(localStorage.getItem('cimAcc')) || [];
    lb.push({ name: window.currentPlayer, nic: window.currentNIC, epf: window.currentEPF, score: score });
    lb.sort((a, b) => a.score - b.score);
    localStorage.setItem('cimAcc', JSON.stringify(lb.slice(0, 10)));

    let pl = JSON.parse(localStorage.getItem('cimPlayed')) || [];
    pl.push(window.currentEPF);
    localStorage.setItem('cimPlayed', JSON.stringify(pl));

    submitScoreToSheet({
        name: window.currentPlayer,
        nic: window.currentNIC,
        epf: window.currentEPF,
        score: score.toFixed(0),
        attempts,
        timestamp: new Date().toISOString()
    });

    updateLeaderboard();
}

// ... (rest of your existing variables and window.onload)

function submitScoreToSheet(payload) {
    if (!GOOGLE_SHEET_ENDPOINT || GOOGLE_SHEET_ENDPOINT.includes('YOUR_SCRIPT_ID')) {
        console.warn('Google Sheets endpoint is not configured.');
        return;
    }

    // Google Apps Script requires form-encoded data when using no-cors mode.
    // JSON with no-cors triggers a preflight that Apps Script cannot handle.
    const formBody = Object.entries(payload)
        .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
        .join('&');

    console.log('Attempting to send payload:', payload);

    fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody
    })
    .then(() => {
        // no-cors returns an opaque response — we can't read it, but the request went through.
        console.log('Score submitted to Google Sheets.');
        const scoreEl = document.getElementById('result-score');
        if (scoreEl) scoreEl.style.color = '#4ade80';
    })
    .catch(error => {
        // Only log — never alert the user for a background sync failure.
        console.warn('Google Sheet submission failed (will not retry):', error);
    });
}

// ... (rest of your existing functions like updateLeaderboard)

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('cimAcc')) || [];
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = "";

    scores.forEach((s, i) => {
        const li = document.createElement('li');
        if (i === 0) li.style.background = "#FFD700";
        else if (i === 1) li.style.background = "#E5E4E2";
        else if (i === 2) li.style.background = "#CD7F32";

        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; gap: 1rem; flex-wrap: wrap; align-items: baseline;">
                <span>${i < 3 ? ['🥇','🥈','🥉'][i] : '#' + (i+1)} ${s.name}</span>
                <b>${s.score.toFixed(0)}px</b>
            </div>
            <small style="opacity:0.6; display: block; margin-top: 0.35rem;">NIC: ${s.nic} • EPF: ${s.epf}</small>
        `;
        list.appendChild(li);
    });
}

document.getElementById('btn-finish').onclick = () => location.reload();
document.getElementById('admin-reset').ondblclick = () => {
    if(confirm("Reset all data?")) { localStorage.clear(); location.reload(); }
};