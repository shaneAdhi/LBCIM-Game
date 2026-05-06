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

// --- CRITICAL LOGO FIX ---
function fixLogos() {
    const logos = document.querySelectorAll('.brand-logo, .brand-logo-small');
    logos.forEach(img => {
        const timestamp = new Date().getTime();
        img.src = "unnamed.jpg?v=" + timestamp;
    });
}
window.addEventListener('load', () => {
    fixLogos();
    updateLeaderboard();
});

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    phone.style.display = (id === 'screen-game') ? 'block' : 'none';
}

document.getElementById('btn-start').onclick = function() {
    const name = document.getElementById('player-name').value.trim();
    const epf = document.getElementById('player-epf').value.trim();

    if (!name || !epf) {
        alert("Please enter both Full Name and EPF Number.");
        return;
    }

    // --- CRITICAL SOUND FIX (Browsers require this on click) ---
    scanSound.play().then(() => {
        scanSound.pause();
        scanSound.currentTime = 0;
    }).catch(e => console.log("Audio Init"));

    const played = JSON.parse(localStorage.getItem('cimPlayed')) || [];
    if (played.includes(epf)) {
        alert("This EPF Number has already played!");
        return;
    }

    window.currentPlayer = name;
    window.currentEPF = epf;
    attempts = 0;
    bestOffset = Infinity;
    
    showScreen('screen-game');
    startGame();
};

function startGame() {
    posX = 0;
    direction = 1;
    speed = 5 + (attempts * 4);
    if (animationId) cancelAnimationFrame(animationId);
    update();
}

function update() {
    const maxPath = arena.offsetWidth - phone.offsetWidth;
    
    // Prevent sticking at edges
    if (posX >= maxPath) { posX = maxPath; direction = -1; }
    else if (posX <= 0) { posX = 0; direction = 1; }

    posX += speed * direction;
    phone.style.left = posX + "px";

    const offset = Math.abs((arena.offsetWidth / 2) - (posX + (phone.offsetWidth / 2)));

    // Neon Green Feedback
    if (offset < 35) viewfinder.classList.add('aligned');
    else viewfinder.classList.remove('aligned');

    animationId = requestAnimationFrame(update);
}

document.getElementById('btn-stop').onclick = function() {
    cancelAnimationFrame(animationId);
    const offset = Math.abs((arena.offsetWidth / 2) - (posX + (phone.offsetWidth / 2)));

    // Play Sound
    scanSound.currentTime = 0;
    scanSound.play().catch(e => console.log("Sound Error"));

    attempts++;
    if (offset < bestOffset) bestOffset = offset;

    if (attempts < 2) {
        alert("Attempt 1: " + offset.toFixed(0) + "px offset. One more try!");
        startGame();
    } else {
        finishGame(bestOffset);
    }
};

function finishGame(score) {
    showScreen('screen-result');
    document.getElementById('result-score').innerText = score.toFixed(0);
    const msgEl = document.getElementById('result-msg');
    
    if (score <= 15) msgEl.innerText = "🎯 WOW! Perfect Alignment!";
    else if (score <= 40) msgEl.innerText = "✨ Great Scan! Well done!";
    else msgEl.innerText = "🤏 Just a bit off! Try again next time.";

    let lb = JSON.parse(localStorage.getItem('cimAcc')) || [];
    
    // SAVE BOTH NAME AND EPF TO THE LEADERBOARD
    lb.push({ 
        name: window.currentPlayer, 
        epf: window.currentEPF, 
        score: score 
    });
    
    lb.sort((a, b) => a.score - b.score);
    localStorage.setItem('cimAcc', JSON.stringify(lb.slice(0, 10)));
    
    // Save to played list to prevent re-entry
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
        li.style.display = "flex";
        li.style.flexDirection = "column"; // Stack info for better spacing
        li.style.padding = "12px";
        li.style.borderRadius = "15px";
        li.style.marginBottom = "10px";
        li.style.border = "1px solid #eee";

        // Color coding for Top 3
        if (i === 0) { li.style.background = "#FFD700"; li.style.fontWeight = "bold"; }
        else if (i === 1) { li.style.background = "#E5E4E2"; }
        else if (i === 2) { li.style.background = "#CD7F32"; li.style.color = "#fff"; }

        // Added the EPF display in a smaller font under the name
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>${i < 3 ? ['🥇','🥈','🥉'][i] : '#' + (i+1)} ${s.name}</span>
                <b>${s.score.toFixed(0)}px</b>
            </div>
            <div style="font-size: 0.75rem; opacity: 0.7; margin-left: 25px;">
                EPF: ${s.epf || 'N/A'}
            </div>
        `;
        list.appendChild(li);
    });

    // Keep the Reset Button at the bottom
    const resetBtn = document.createElement('button');
    resetBtn.innerText = "RESET ALL DATA";
    resetBtn.style.cssText = "margin-top:20px; padding:10px; width:100%; background:#ffeded; color:#cc0000; border:1px dashed #cc0000; border-radius:8px; cursor:pointer;";
    resetBtn.ondblclick = () => {
        if(confirm("Clear leaderboard?")) { localStorage.clear(); location.reload(); }
    };
    list.appendChild(resetBtn);
}

function updateLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('cimAcc')) || [];
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = "";

    scores.forEach((s, i) => {
        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.flexDirection = "column"; // Stack info for better spacing
        li.style.padding = "12px";
        li.style.borderRadius = "15px";
        li.style.marginBottom = "10px";
        li.style.border = "1px solid #eee";

        // Color coding for Top 3
        if (i === 0) { li.style.background = "#FFD700"; li.style.fontWeight = "bold"; }
        else if (i === 1) { li.style.background = "#E5E4E2"; }
        else if (i === 2) { li.style.background = "#CD7F32"; li.style.color = "#fff"; }

        // Added the EPF display in a smaller font under the name
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span>${i < 3 ? ['🥇','🥈','🥉'][i] : '#' + (i+1)} ${s.name}</span>
                <b>${s.score.toFixed(0)}px</b>
            </div>
            <div style="font-size: 0.75rem; opacity: 0.7; margin-left: 25px;">
                EPF: ${s.epf || 'N/A'}
            </div>
        `;
        list.appendChild(li);
    });

    // Keep the Reset Button at the bottom
    const resetBtn = document.createElement('button');
    resetBtn.innerText = "RESET ALL DATA";
    resetBtn.style.cssText = "margin-top:20px; padding:10px; width:100%; background:#ffeded; color:#cc0000; border:1px dashed #cc0000; border-radius:8px; cursor:pointer;";
    resetBtn.ondblclick = () => {
        if(confirm("Clear leaderboard?")) { localStorage.clear(); location.reload(); }
    };
    list.appendChild(resetBtn);
}

document.getElementById('btn-finish').onclick = function() { location.reload(); };
document.getElementById('admin-reset').onclick = function() {
    if(confirm("Reset everything?")) { localStorage.clear(); location.reload(); }
};