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
    const epf = document.getElementById('player-epf').value.trim();
    if (!name || !epf) return alert("Please enter Name and EPF.");

    // Unmute for browser
    scanSound.play().then(() => { scanSound.pause(); scanSound.currentTime = 0; }).catch(() => {});

    const played = JSON.parse(localStorage.getItem('cimPlayed')) || [];
    if (played.includes(epf)) return alert("This EPF has already played!");

    window.currentPlayer = name;
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
    lb.push({ name: window.currentPlayer, epf: window.currentEPF, score: score });
    lb.sort((a, b) => a.score - b.score);
    localStorage.setItem('cimAcc', JSON.stringify(lb.slice(0, 10)));

    let pl = JSON.parse(localStorage.getItem('cimPlayed')) || [];
    pl.push(window.currentEPF);
    localStorage.setItem('cimPlayed', JSON.stringify(pl));

    updateLeaderboard();
}

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
            <div style="display:flex; justify-content:space-between">
                <span>${i < 3 ? ['🥇','🥈','🥉'][i] : '#' + (i+1)} ${s.name}</span>
                <b>${s.score.toFixed(0)}px</b>
            </div>
            <small style="opacity:0.6">EPF: ${s.epf}</small>
        `;
        list.appendChild(li);
    });
}

document.getElementById('btn-finish').onclick = () => location.reload();
document.getElementById('admin-reset').ondblclick = () => {
    if(confirm("Reset all data?")) { localStorage.clear(); location.reload(); }
};