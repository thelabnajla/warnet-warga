/*
 * CORE STATE DICTIONARIES
 */
let state = {
    currentTab: 'landing',
    currentClientPC: 'PC-07',
    revenue: 125000,
    activeClientPC: {
        id: 'PC-07',
        timeRemaining: 9000, // 2h 30m in seconds
        baseRate: 6000,
        accumulatedCost: 15000,
        status: 'Active',
        hardwareStatus: { mouse: 'Normal', headset: 'Normal' }
    },
    pcs: [
        { id: 'PC-01', type: 'VIP', status: 'Active', user: 'Zaky_PB_Gamer', remaining: 3600, rate: 10000 },
        { id: 'PC-02', type: 'VIP', status: 'Active', user: 'LostSagaGod', remaining: 5400, rate: 10000 },
        { id: 'PC-03', type: 'VIP', status: 'Idle', user: '', remaining: 0, rate: 10000 },
        { id: 'PC-04', type: 'VIP', status: 'Maintenance', user: '', remaining: 0, rate: 10000 },
        { id: 'PC-05', type: 'Regular', status: 'Active', user: 'IndomieAddict', remaining: 1800, rate: 6000 },
        { id: 'PC-06', type: 'Regular', status: 'Idle', user: '', remaining: 0, rate: 6000 },
        { id: 'PC-07', type: 'VIP', status: 'Active', user: 'You (Simulator)', remaining: 9000, rate: 10000 },
        { id: 'PC-08', type: 'Regular', status: 'Active', user: 'Bocil_Kematian', remaining: 4200, rate: 6000 },
        { id: 'PC-09', type: 'Regular', status: 'Idle', user: '', remaining: 0, rate: 6000 },
        { id: 'PC-10', type: 'Regular', status: 'Active', user: 'Ayah_PB', remaining: 7200, rate: 6000 },
        { id: 'PC-11', type: 'Regular', status: 'Active', user: 'GarenaKing', remaining: 2900, rate: 6000 },
        { id: 'PC-12', type: 'Regular', status: 'Maintenance', user: '', remaining: 0, rate: 6000 }
    ],
    orders: [], // Pending Indomie/Drink orders
    products: [
        { id: 'ind-goreng-db', name: 'Indomie Goreng Double + Telur', category: 'Food', price: 12000, icon: 'fa-bowl-hot', popular: true },
        { id: 'ind-rebus-st', name: 'Indomie Soto Rebus + Telur', category: 'Food', price: 11000, icon: 'fa-soup', popular: false },
        { id: 'es-teh-jumbo', name: 'Es Teh Manis Jumbo (Anti-Lag)', category: 'Drink', price: 4000, icon: 'fa-glass-water', popular: true },
        { id: 'kukubima-susu', name: 'KukuBima Ener-G Susu', category: 'Drink', price: 6000, icon: 'fa-whiskey-glass', popular: true },
        { id: 'roti-bakar', name: 'Roti Bakar Coklat Keju', category: 'Snack', price: 8000, icon: 'fa-bread-slice', popular: false },
        { id: 'aqua-dingin', name: 'Aqua Dingin Sedot', category: 'Drink', price: 3000, icon: 'fa-bottle-water', popular: false }
    ],
    chatHistory: [
        { sender: 'Mas OP', time: '11:10', message: 'Welcome to Netizen Cyber Hub, buddy! Let me know if you want Indomie, your billing time is low, or if a game needs patching. Enjoy gaming!' }
    ],
    calc: {
        tierRate: 6000,
        hours: 3,
        promoApplied: false,
        promoTitle: ''
    },
    game: {
        active: false,
        score: 0,
        ping: 350,
        timeLeft: 30,
        interval: null,
        targetInterval: null
    }
};

/*
 * REUSEABLE SYNTH SOUNDS VIA WEB AUDIO API
 */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSynthSound(type) {
    // Check if audio context is allowed
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'classic-beep') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'disconnect') {
        // Short retro down-sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'game-launch') {
        // Happy retro up-sweep
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'mati-lampu') {
        // Deep retro buzz descending
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
    } else if (type === 'coin') {
        // Legendary coin chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    }
}

/*
 * UI NOTIFICATION TOASTER
 */
function showNotification(title, message, iconClass = 'fa-info-circle', type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');

    let typeClasses = 'border-slate-800 bg-slate-900/95';
    let iconColor = 'text-indigo-400';
    if (type === 'success') {
        typeClasses = 'border-emerald-800 bg-slate-950/95';
        iconColor = 'text-emerald-400';
    } else if (type === 'warning') {
        typeClasses = 'border-amber-800 bg-slate-950/95';
        iconColor = 'text-amber-500 animate-pulse';
    }

    toast.className = `p-4 rounded-xl border ${typeClasses} shadow-xl flex items-start space-x-3 transition-all duration-300 opacity-0 transform translate-y-2 pointer-events-auto`;
    toast.innerHTML = `
                <div class="p-1.5 rounded-lg bg-slate-800 flex-shrink-0">
                    <i class="fa-solid ${iconClass} ${iconColor} text-sm"></i>
                </div>
                <div class="flex-grow">
                    <h5 class="font-bold text-xs text-white">${title}</h5>
                    <p class="text-[10px] text-slate-400 mt-0.5 leading-relaxed">${message}</p>
                </div>
                <button onclick="this.parentElement.remove()" class="text-slate-500 hover:text-slate-200"><i class="fa-solid fa-xmark text-xs"></i></button>
            `;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    }, 50);

    // Auto-remove
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}

// CUSTOM MODAL ALERTS REPLACING SYSTEM ALERT/CONFIRM
function alertBox(message, title = 'Netizen Notice') {
    document.getElementById('modal-alert-title').innerText = title;
    document.getElementById('modal-alert-text').innerText = message;
    document.getElementById('modal-alert').classList.remove('hidden');
}

function closeAlertBox() {
    document.getElementById('modal-alert').classList.add('hidden');
}

/*
 * NAVIGATION CONTROLS
 */
function switchTab(targetTab) {
    state.currentTab = targetTab;

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(element => {
        element.classList.add('hidden');
    });

    // Show target
    document.getElementById(`tab-${targetTab}`).classList.remove('hidden');

    // Reset active styles on desktop navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.className = "nav-btn whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition text-slate-300 hover:text-white hover:bg-slate-800/60";
    });

    // Apply active class to selected desktop nav button
    const activeBtn = document.getElementById(`btn-tab-${targetTab}`);
    if (activeBtn) {
        activeBtn.className = "nav-btn whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition text-purple-400 bg-purple-950/40 border border-purple-900/50";
    }

    // Update mobile navigation items highlight
    const mobileTabs = ['landing', 'client', 'operator', 'warung', 'arcade'];
    mobileTabs.forEach(t => {
        const btn = document.getElementById(`m-btn-tab-${t}`);
        if (btn) {
            if (t === targetTab) {
                btn.className = "flex flex-col items-center text-purple-400";
            } else {
                btn.className = "flex flex-col items-center text-slate-400 hover:text-white";
            }
        }
    });

    // Specific Tab Initializations
    if (targetTab === 'client') {
        playSynthSound('classic-beep');
    } else if (targetTab === 'arcade') {
        resetGameUI();
    }
}

/*
 * RENDER LANDING & FLOOR PLAN
 */
function renderFloorplan() {
    const gridContainer = document.getElementById('grid-floorplan');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    state.pcs.forEach(pc => {
        let statusBg = 'bg-slate-800 border-slate-700 hover:border-slate-500';
        let indicator = 'bg-slate-500';
        let actionBtnText = 'Manage';

        if (pc.status === 'Active') {
            statusBg = 'bg-slate-900 border-emerald-500/50 hover:border-emerald-400';
            indicator = 'bg-emerald-500';
        } else if (pc.status === 'Maintenance') {
            statusBg = 'bg-slate-900/40 border-rose-950/50 cursor-not-allowed opacity-50';
            indicator = 'bg-rose-500';
            actionBtnText = 'Broken';
        }

        const card = document.createElement('div');
        card.className = `p-3 rounded-xl border flex flex-col justify-between h-28 cursor-pointer transition transform hover:-translate-y-0.5 ${statusBg}`;
        card.setAttribute('ondblclick', `managePcNode('${pc.id}')`);
        card.setAttribute('onclick', `managePcNode('${pc.id}')`);

        card.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-200">${pc.id}</span>
                        <span class="w-2 h-2 rounded-full ${indicator}"></span>
                    </div>
                    <div>
                        <span class="text-[9px] text-slate-400 font-mono">${pc.type} Spec</span>
                        <div class="text-[10px] text-slate-200 truncate mt-0.5">${pc.status === 'Active' ? pc.user : 'Available'}</div>
                    </div>
                    <div class="text-[9px] font-bold text-slate-500 flex justify-between items-center mt-1 border-t border-slate-800 pt-1">
                        <span>${pc.status === 'Active' ? formatSeconds(pc.remaining) : '-'}</span>
                        <span class="text-indigo-400 hover:underline">Click</span>
                    </div>
                `;

        gridContainer.appendChild(card);
    });

    // Update total counters
    const activeCount = state.pcs.filter(p => p.status === 'Active').length;
    document.getElementById('active-pc-count').innerText = `${activeCount}/12 Active PCs`;
}

function managePcNode(pcId) {
    // Direct user either to client simulator if PC-07 is selected, or operator dashboard to see adjustments.
    if (pcId === 'PC-07') {
        switchTab('client');
        showNotification("Simulator Redirect", "You have occupied PC-07! Your billing is fully active.", "fa-desktop", "success");
    } else {
        switchTab('operator');
        showNotification("Station View", `Checking console controls for ${pcId}.`, "fa-sliders");

        // Scroll operator view to station if possible
        const elem = document.getElementById(`op-node-${pcId}`);
        if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            elem.classList.add('border-indigo-500', 'glow-purple');
            setTimeout(() => {
                elem.classList.remove('border-indigo-500', 'glow-purple');
            }, 2000);
        }
    }
}

/*
 * CLIENT PORTAL (PC-07 CLIENT SIMULATOR) SYSTEM
 */
function updateClientBillingUI() {
    // Format time left
    const clientTimerStr = formatSeconds(state.activeClientPC.timeRemaining);
    document.getElementById('client-timer').innerText = clientTimerStr;

    // Format Billing Cost based on dynamic usage or preset cost
    document.getElementById('client-cost').innerText = `Rp ${state.activeClientPC.accumulatedCost.toLocaleString('id-ID')}`;
}

// Launch Client Game on OS screen simulation
function launchClientGame(gameName) {
    playSynthSound('game-launch');
    const popup = document.getElementById('desktop-popup');
    const title = document.getElementById('desktop-popup-title');
    const content = document.getElementById('desktop-popup-content');

    title.innerHTML = `<i class="fa-solid fa-gamepad mr-2 text-red-500"></i> Game Active: ${gameName}.exe`;

    let bgGlowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.2)]';
    let loadingBarColor = 'bg-red-500';

    content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 rounded-lg border border-slate-800 ${bgGlowClass}">
                    <i class="fa-solid fa-gamepad text-5xl text-red-500 mb-4 animate-bounce"></i>
                    <h5 class="text-sm font-bold text-white mb-2">Connecting to ${gameName} Server...</h5>
                    <div class="w-48 bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                        <div class="h-full ${loadingBarColor} animate-[pulse_1.5s_infinite]" style="width: 75%"></div>
                    </div>
                    <p class="text-[10px] text-slate-400">FPS: 144 | Ping: 18ms | VIP Server Connection</p>
                </div>
            `;
    popup.classList.remove('hidden');

    // Auto update status text inside client system alerts
    document.getElementById('client-system-alert').innerHTML = `<i class="fa-solid fa-gamepad text-emerald-400 mr-1"></i> Running ${gameName}`;
}

// Launch general system apps
function launchClientApp(appName) {
    playSynthSound('classic-beep');
    const popup = document.getElementById('desktop-popup');
    const title = document.getElementById('desktop-popup-title');
    const content = document.getElementById('desktop-popup-content');

    title.innerHTML = `<i class="fa-solid fa-video mr-2 text-indigo-400"></i> Browser app: ${appName}`;

    content.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-4 rounded-lg">
                    <i class="fa-brands fa-youtube text-5xl text-rose-500 mb-4 animate-pulse"></i>
                    <h5 class="text-xs font-bold text-white mb-2">Streaming Classic Warnet Compilation</h5>
                    <p class="text-[10px] text-slate-400 max-w-xs mb-4">"Nostalgia Billing Warnet 2012 lirik lagunya bikin kangen..."</p>
                    <div class="flex space-x-2">
                        <button onclick="playSynthSound('classic-beep'); alertBox('Volume has been balanced. Make sure headset cord is tight!')" class="px-4 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-lg border border-slate-700 hover:text-white transition">Unmute Audio</button>
                    </div>
                </div>
            `;
    popup.classList.remove('hidden');
}

function closeDesktopApp() {
    document.getElementById('desktop-popup').classList.add('hidden');
    document.getElementById('client-system-alert').innerHTML = `<i class="fa-solid fa-volume-high text-indigo-400 mr-1"></i> Desktop Idle`;
}

function focusOperatorChat() {
    const input = document.getElementById('chat-input');
    input.focus();
    input.placeholder = "Pesan Indomie atau tambah billing...";
    showNotification("Live chat", "Enter message for Mas OP.", "fa-comment-dots");
}

// Order food from client billing interface directly
function quickOrderFood() {
    playSynthSound('classic-beep');
    switchTab('warung');
    showNotification("Direct Menu", "Select your comfort food to submit your delivery directly!", "fa-bowl-food");
}

// Add billing time prompt
function addClientTimePrompt() {
    playSynthSound('classic-beep');
    alertBox("To add billing time, browse our dynamic calculator on the Home screen or request 'Mas OP' via Operator Chat!", "Increase Billing Time");
}

// Lock client simulator mock screen
function lockClientScreen() {
    playSynthSound('disconnect');
    alertBox("You have signed off from PC-07. Session finalized.", "Billing System Sign-out");
    state.activeClientPC.status = 'Idle';
    state.activeClientPC.timeRemaining = 0;
    updateClientBillingUI();

    // Set corresponding index in global pcs
    const pIdx = state.pcs.findIndex(p => p.id === 'PC-07');
    if (pIdx !== -1) {
        state.pcs[pIdx].status = 'Idle';
        state.pcs[pIdx].user = '';
        state.pcs[pIdx].remaining = 0;
    }
    renderFloorplan();
    renderOperatorStations();
}

// Fix mouse or headset mock issues
function simulateHardwareInteractions(type) {
    playSynthSound('classic-beep');
    if (type === 'mouse') {
        showNotification("Mouse Fixed", "Reconnected USB hub. Cursor lag cleared!", "fa-mouse", "success");
    } else if (type === 'headset') {
        showNotification("Audio Settled", "Adjusted jack connector. Static hiss gone!", "fa-headphones", "success");
    }
}

/*
 * CLIENT CHAT LOGIC (CHAT SYSTEM)
 */
function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const messageText = input.value.trim();
    if (!messageText) return;

    // Push client message
    state.chatHistory.push({
        sender: 'You (PC-07)',
        time: getFormattedTime(),
        message: messageText
    });

    // Append immediately to view
    renderChatHistory();
    input.value = '';

    // Play typical key-press chime
    playSynthSound('classic-beep');

    // Trigger operator simulated smart responses after 1.5 seconds delay
    setTimeout(() => {
        let opReply = "Bentar ya dek, lagi dibikinin / diproses!";

        // Simple keyword matching for interactive feel
        const lowerMsg = messageText.toLowerCase();
        if (lowerMsg.includes('indomie') || lowerMsg.includes('lapar') || lowerMsg.includes('makan')) {
            opReply = "Siap dek, Indomie telor setengah matengnya meluncur! Tunggu ya.";
        } else if (lowerMsg.includes('billing') || lowerMsg.includes('tambah') || lowerMsg.includes('jam')) {
            opReply = "Oke dek, billing PC-07 udah ditambahin 1 jam ya. Nanti bayar belakangan!";
            // Add time to simulator
            state.activeClientPC.timeRemaining += 3600;
            state.activeClientPC.accumulatedCost += 10000;
            updateClientBillingUI();
        } else if (lowerMsg.includes('lag') || lowerMsg.includes('mati') || lowerMsg.includes('rusak')) {
            opReply = "Coba cabut colok lagi headset / mouse-nya dek. Kalau masih lag nanti Mas samperin.";
        } else if (lowerMsg.includes('mati lampu')) {
            opReply = "Aduh, Genset kita lagi mati dek, moga gak jebol MCB-nya!";
        }

        state.chatHistory.push({
            sender: 'Mas OP',
            time: getFormattedTime(),
            message: opReply
        });

        renderChatHistory();
        playSynthSound('classic-beep');
        showNotification("Message from Operator", opReply, "fa-comment-dots");
    }, 1200);
}

function renderChatHistory() {
    const chatBox = document.getElementById('op-chat-messages');
    if (!chatBox) return;

    chatBox.innerHTML = '';
    state.chatHistory.forEach(msg => {
        const isOp = msg.sender === 'Mas OP';
        const containerClass = isOp ? 'bg-slate-850 border-slate-800' : 'bg-purple-950/20 border-purple-900/40 ml-4';
        const nameColor = isOp ? 'text-indigo-400' : 'text-purple-300';

        chatBox.innerHTML += `
                    <div class="p-2.5 rounded-xl border ${containerClass}">
                        <span class="${nameColor} font-bold block mb-1">${msg.sender} <span class="text-[9px] text-slate-500 font-normal">${msg.time}</span></span>
                        ${msg.message}
                    </div>
                `;
    });

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

function requestOpCall() {
    playSynthSound('classic-beep');
    showNotification("OP Summoned", "Summon alert pinged to admin monitor desk.", "fa-bell", "warning");

    // Push message simulating physical call
    state.chatHistory.push({
        sender: 'You (PC-07)',
        time: getFormattedTime(),
        message: "*Melambaikan tangan panggil Operator*"
    });
    renderChatHistory();
}

/*
 * OPERATOR PORTAL SYSTEM FUNCTIONS
 */
function renderOperatorStations() {
    const stationsList = document.getElementById('op-stations-list');
    if (!stationsList) return;

    stationsList.innerHTML = '';

    state.pcs.forEach(pc => {
        let statusText = 'Idle (No connection)';
        let cardBorder = 'border-slate-800';
        let actionBtn = '';

        if (pc.status === 'Active') {
            statusText = `Playing: ${pc.user || 'Guest'}`;
            cardBorder = 'border-emerald-600/50';
            actionBtn = `
                        <div class="flex space-x-1">
                            <button onclick="opAddTimeToPc('${pc.id}', 3600)" class="bg-indigo-900 hover:bg-indigo-800 text-indigo-300 text-[10px] font-bold py-1 px-2 rounded">
                                +1 Hour
                            </button>
                            <button onclick="opLockPc('${pc.id}')" class="bg-rose-900/60 hover:bg-rose-900 text-rose-300 text-[10px] font-bold py-1 px-2 rounded">
                                Lock
                            </button>
                        </div>
                    `;
        } else if (pc.status === 'Maintenance') {
            statusText = 'Under repair / Broken hardware';
            cardBorder = 'border-rose-900/40 bg-slate-950/20';
            actionBtn = `
                        <button onclick="opFixPc('${pc.id}')" class="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold py-1 px-2 rounded border border-emerald-900">
                            Complete Repair
                        </button>
                    `;
        } else {
            cardBorder = 'border-slate-850';
            actionBtn = `
                        <button onclick="opStartClientMock('${pc.id}')" class="bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold py-1 px-2.5 rounded">
                            Rent Client
                        </button>
                    `;
        }

        const block = document.createElement('div');
        block.id = `op-node-${pc.id}`;
        block.className = `p-4 rounded-2xl border ${cardBorder} bg-slate-950/40 flex flex-col justify-between space-y-3 transition duration-300`;

        block.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full ${pc.status === 'Active' ? 'bg-emerald-500 animate-pulse' : pc.status === 'Maintenance' ? 'bg-rose-500' : 'bg-slate-600'}"></span>
                            <span class="font-bold text-sm text-white">${pc.id}</span>
                            <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">${pc.type}</span>
                        </div>
                        <span class="text-xs font-mono font-bold ${pc.status === 'Active' ? 'text-emerald-400' : 'text-slate-500'}">
                            ${pc.status === 'Active' ? formatSeconds(pc.remaining) : '00:00:00'}
                        </span>
                    </div>
                    
                    <div class="text-xs text-slate-400">
                        ${statusText}
                    </div>

                    <div class="flex items-center justify-between pt-2 border-t border-slate-900">
                        <span class="text-[10px] text-slate-500">${pc.status === 'Active' ? 'Rate: Rp ' + pc.rate.toLocaleString('id-ID') + '/hr' : 'Off-billing'}</span>
                        ${actionBtn}
                    </div>
                `;

        stationsList.appendChild(block);
    });

    // Update stats
    const opStatActive = document.getElementById('op-stat-active');
    if (opStatActive) {
        const totalSecsActive = state.pcs.reduce((acc, pc) => acc + (pc.status === 'Active' ? pc.remaining : 0), 0);
        opStatActive.innerText = `${(totalSecsActive / 3600 + 14.2).toFixed(1)} Hours`;
    }
}

// Admin: Add time to specified PC node
function opAddTimeToPc(pcId, secs) {
    playSynthSound('classic-beep');
    const pcIdx = state.pcs.findIndex(p => p.id === pcId);
    if (pcIdx !== -1) {
        state.pcs[pcIdx].remaining += secs;

        // If it's the simulator client PC, synchronise local simulator state
        if (pcId === 'PC-07') {
            state.activeClientPC.timeRemaining += secs;
            state.activeClientPC.accumulatedCost += 10000;
            updateClientBillingUI();
        }

        showNotification("Time Updated", `Added +1 hour play session to ${pcId}.`, "fa-clock", "success");
        renderOperatorStations();
        renderFloorplan();
    }
}

// Admin: Lock specified PC node
function opLockPc(pcId) {
    playSynthSound('disconnect');
    const pcIdx = state.pcs.findIndex(p => p.id === pcId);
    if (pcIdx !== -1) {
        // Update Revenue with accumulated cost simulation
        const costSimulated = state.pcs[pcIdx].type === 'VIP' ? 20000 : 12000;
        state.revenue += costSimulated;
        updateStatsDisplay();

        state.pcs[pcIdx].status = 'Idle';
        state.pcs[pcIdx].user = '';
        state.pcs[pcIdx].remaining = 0;

        if (pcId === 'PC-07') {
            state.activeClientPC.status = 'Idle';
            state.activeClientPC.timeRemaining = 0;
            updateClientBillingUI();
        }

        showNotification("Station Locked", `${pcId} session ended and disconnected successfully.`, "fa-lock");
        renderOperatorStations();
        renderFloorplan();
    }
}

// Admin: Start a mock rental
function opStartClientMock(pcId) {
    playSynthSound('coin');
    const pcIdx = state.pcs.findIndex(p => p.id === pcId);
    if (pcIdx !== -1) {
        const names = ['Agung_Gamer', 'BocilPB_3', 'ReyhanSlayer', 'GamingSultan', 'Tio_Net'];
        const randomUser = names[Math.floor(Math.random() * names.length)];

        state.pcs[pcIdx].status = 'Active';
        state.pcs[pcIdx].user = randomUser;
        state.pcs[pcIdx].remaining = 7200; // 2 hours

        if (pcId === 'PC-07') {
            state.activeClientPC.status = 'Active';
            state.activeClientPC.timeRemaining = 7200;
            updateClientBillingUI();
        }

        showNotification("Station Active", `${pcId} rented out to ${randomUser}.`, "fa-desktop", "success");
        renderOperatorStations();
        renderFloorplan();
    }
}

// Admin: Repair broken PC
function opFixPc(pcId) {
    playSynthSound('classic-beep');
    const pcIdx = state.pcs.findIndex(p => p.id === pcId);
    if (pcIdx !== -1) {
        state.pcs[pcIdx].status = 'Idle';
        showNotification("Repair Complete", `${pcId} is back online and ready for rent!`, "fa-wrench", "success");
        renderOperatorStations();
        renderFloorplan();
    }
}

// Updates top level statistics
function updateStatsDisplay() {
    document.getElementById('header-revenue').innerText = `Rp ${state.revenue.toLocaleString('id-ID')}`;
    const opStatProfit = document.getElementById('op-stat-profit');
    if (opStatProfit) {
        opStatProfit.innerText = `Rp ${state.revenue.toLocaleString('id-ID')}`;
    }
}

/*
 * WARUNG NETIZEN SHOP SYSTEM
 */
function renderWarungProducts() {
    const grid = document.getElementById('warung-products-grid');
    if (!grid) return;

    grid.innerHTML = '';

    state.products.forEach(prod => {
        const card = document.createElement('div');
        card.className = `bg-slate-900 border ${prod.popular ? 'border-purple-500/40 glow-purple' : 'border-slate-800'} p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition`;

        card.innerHTML = `
                    <div class="flex items-start justify-between">
                        <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xl text-amber-500">
                            <i class="fa-solid ${prod.icon}"></i>
                        </div>
                        ${prod.popular ? '<span class="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-widest">Gamers Fave</span>' : ''}
                    </div>

                    <div>
                        <span class="text-[10px] text-slate-500 uppercase font-semibold font-mono">${prod.category}</span>
                        <h4 class="font-bold text-sm text-white mt-0.5">${prod.name}</h4>
                        <p class="text-xs font-extrabold text-amber-400 mt-1">Rp ${prod.price.toLocaleString('id-ID')}</p>
                    </div>

                    <button onclick="placeWarungOrder('${prod.id}')" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition flex items-center justify-center">
                        <i class="fa-solid fa-cart-plus mr-1.5"></i> Order & Deliver to PC-07
                    </button>
                `;

        grid.appendChild(card);
    });
}

function placeWarungOrder(productId) {
    playSynthSound('coin');
    const prod = state.products.find(p => p.id === productId);
    if (!prod) return;

    // Generate order block
    const newOrder = {
        id: `ORD-${Math.floor(Math.random() * 900) + 100}`,
        productName: prod.name,
        price: prod.price,
        pcId: 'PC-07',
        status: 'Cooking'
    };

    state.orders.push(newOrder);

    // Add to client system alert
    document.getElementById('client-system-alert').innerHTML = `<i class="fa-solid fa-clock text-amber-500 mr-1 animate-pulse"></i> Indomie order in queue...`;

    showNotification("Order Submitted", `Ordered ${prod.name}. Delivery heading to PC-07!`, "fa-bowl-food", "success");

    // Sync operator view
    renderOperatorOrders();
    renderChatHistory();

    // Simulate automatic chat reminder
    state.chatHistory.push({
        sender: 'You (PC-07)',
        time: getFormattedTime(),
        message: `*Order confirmation:* Saya pesan ${prod.name} ya Mas!`
    });
    renderChatHistory();

    // Update pending counters
    const orderCounter = document.getElementById('op-stat-orders');
    if (orderCounter) {
        const cookingCount = state.orders.filter(o => o.status === 'Cooking').length;
        orderCounter.innerText = `${cookingCount} Pending`;
    }
}

function renderOperatorOrders() {
    const list = document.getElementById('op-orders-list');
    if (!list) return;

    if (state.orders.length === 0) {
        list.innerHTML = `<div class="text-center py-4 text-xs text-slate-500">No active orders from clients yet.</div>`;
        return;
    }

    list.innerHTML = '';
    state.orders.forEach(order => {
        let statusBadge = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
        let actionBtn = `
                    <button onclick="completeOrder('${order.id}')" class="bg-emerald-900 hover:bg-emerald-800 text-emerald-300 font-bold text-[10px] py-1 px-2.5 rounded border border-emerald-800 transition">
                        Serve Order
                    </button>
                `;

        if (order.status === 'Completed') {
            statusBadge = 'bg-slate-800 text-slate-500 border border-slate-700';
            actionBtn = `<span class="text-[10px] text-emerald-400 font-semibold uppercase"><i class="fa-solid fa-circle-check mr-1"></i> Delivered</span>`;
        }

        const block = document.createElement('div');
        block.className = `p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between gap-2`;

        block.innerHTML = `
                    <div>
                        <div class="flex items-center space-x-1.5">
                            <span class="font-bold text-xs text-white">${order.productName}</span>
                            <span class="text-[9px] px-1.5 py-0.5 rounded-full ${statusBadge}">${order.status}</span>
                        </div>
                        <span class="text-[9px] text-slate-500 block mt-0.5">Dest: <strong class="text-indigo-300">${order.pcId}</strong> | Price: Rp ${order.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                        ${actionBtn}
                    </div>
                `;

        list.appendChild(block);
    });
}

// Operator delivers the food order to client
function completeOrder(orderId) {
    playSynthSound('classic-beep');
    const ordIdx = state.orders.findIndex(o => o.id === orderId);
    if (ordIdx !== -1) {
        state.orders[ordIdx].status = 'Completed';

        // Add revenue to our financial summary
        state.revenue += state.orders[ordIdx].price;
        updateStatsDisplay();

        // If the order was destined for client PC-07, notify local simulator view
        if (state.orders[ordIdx].pcId === 'PC-07') {
            document.getElementById('client-system-alert').innerHTML = `<i class="fa-solid fa-bowl-hot text-emerald-400 mr-1"></i> Food has arrived! Nyem nyem...`;

            // Push automated chat reply
            state.chatHistory.push({
                sender: 'Mas OP',
                time: getFormattedTime(),
                message: "Ini dek, Indomie & minumannya udah di meja PC-07 ya. Makan dulu, mumpung masih panas!"
            });
            renderChatHistory();
            showNotification("Order Arrived!", "Indomie has landed on your table!", "fa-bowl-food", "success");
        }

        showNotification("Order Completed", `Delivered to PC-07. Cash of Rp ${state.orders[ordIdx].price.toLocaleString('id-ID')} added.`, "fa-wallet", "success");

        renderOperatorOrders();

        // Update pending counters
        const orderCounter = document.getElementById('op-stat-orders');
        if (orderCounter) {
            const cookingCount = state.orders.filter(o => o.status === 'Cooking').length;
            orderCounter.innerText = `${cookingCount} Pending`;
        }
    }
}

/*
 * CALCULATOR PORTAL
 */
function updateCalcEstimates() {
    const tierSelect = document.getElementById('calc-tier');
    const hoursRange = document.getElementById('calc-hours');
    const hoursTxt = document.getElementById('calc-hours-txt');
    const costDisplay = document.getElementById('calc-cost-display');

    if (!tierSelect || !hoursRange) return;

    state.calc.tierRate = parseInt(tierSelect.value);
    state.calc.hours = parseInt(hoursRange.value);
    hoursTxt.innerText = `${state.calc.hours}h`;

    let finalCost = state.calc.tierRate * state.calc.hours;

    // Apply quick logic for bundlers if state permits
    if (state.calc.promoApplied) {
        finalCost = state.calc.promoPrice;
    }

    costDisplay.innerText = `Rp ${finalCost.toLocaleString('id-ID')}`;
}

function setCalcPromo(price, hours) {
    playSynthSound('classic-beep');
    state.calc.promoApplied = true;
    state.calc.promoPrice = price;
    state.calc.hours = hours;

    const hoursRange = document.getElementById('calc-hours');
    if (hoursRange) {
        hoursRange.value = hours;
    }

    updateCalcEstimates();
    showNotification("Promo Applied", "Selected billing bundle package discount rate!", "fa-percentage", "success");
}

// User starts session from calculator
function startCalculatedSession() {
    playSynthSound('coin');

    let finalCost = state.calc.tierRate * state.calc.hours;
    if (state.calc.promoApplied) {
        finalCost = state.calc.promoPrice;
    }

    // Sync with local active simulator Client PC
    state.activeClientPC.status = 'Active';
    state.activeClientPC.timeRemaining = state.calc.hours * 3600;
    state.activeClientPC.accumulatedCost = finalCost;

    // Sync with central lists
    const pcIdx = state.pcs.findIndex(p => p.id === 'PC-07');
    if (pcIdx !== -1) {
        state.pcs[pcIdx].status = 'Active';
        state.pcs[pcIdx].user = 'You (Simulator)';
        state.pcs[pcIdx].remaining = state.calc.hours * 3600;
    }

    updateClientBillingUI();
    renderFloorplan();
    renderOperatorStations();

    // Direct view
    switchTab('client');
    showNotification("Billing Commenced", `Welcome back! Seat PC-07 is ready for ${state.calc.hours} hour(s).`, "fa-play", "success");
}

/*
 * "PING BOOSTER" MINI GAME CONTROLS
 */
function resetGameUI() {
    clearInterval(state.game.interval);
    clearInterval(state.game.targetInterval);
    state.game.active = false;
    state.game.score = 0;
    state.game.ping = 350;
    state.game.timeLeft = 30;

    document.getElementById('game-start-overlay').classList.remove('hidden');
    document.getElementById('game-target').classList.add('hidden');
    document.getElementById('game-ping').innerText = '350 ms';
    document.getElementById('game-score').innerText = '0 / 20';
    document.getElementById('game-timer').innerText = '30s';
}

function startGame() {
    playSynthSound('classic-beep');
    state.game.active = true;
    state.game.score = 0;
    state.game.ping = 350;
    state.game.timeLeft = 30;

    document.getElementById('game-start-overlay').classList.add('hidden');

    // Display & position first target
    moveTargetRandomly();

    // Set countdown timers
    state.game.interval = setInterval(() => {
        state.game.timeLeft--;
        document.getElementById('game-timer').innerText = `${state.game.timeLeft}s`;

        if (state.game.timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Relocate target automatically if missed within 2 seconds
    state.game.targetInterval = setInterval(() => {
        if (state.game.active) {
            moveTargetRandomly();
        }
    }, 1800);
}

function moveTargetRandomly() {
    const target = document.getElementById('game-target');
    const canvas = document.getElementById('game-canvas-area');
    if (!target || !canvas) return;

    const maxX = canvas.clientWidth - 50;
    const maxY = canvas.clientHeight - 50;

    const randX = Math.floor(Math.random() * maxX);
    const randY = Math.floor(Math.random() * maxY);

    target.style.left = `${randX}px`;
    target.style.top = `${randY}px`;
    target.classList.remove('hidden');
}

function hitTarget(event) {
    event.stopPropagation();
    if (!state.game.active) return;

    playSynthSound('coin');
    state.game.score++;

    // Decimate the ping rate
    state.game.ping = Math.max(5, state.game.ping - Math.floor(Math.random() * 25) - 15);

    document.getElementById('game-score').innerText = `${state.game.score} / 20`;
    document.getElementById('game-ping').innerText = `${state.game.ping} ms`;

    // Immediate relocator
    moveTargetRandomly();

    if (state.game.score >= 20 || state.game.ping <= 5) {
        endGame(true);
    }
}

function endGame(won = false) {
    state.game.active = false;
    clearInterval(state.game.interval);
    clearInterval(state.game.targetInterval);

    document.getElementById('game-target').classList.add('hidden');

    if (won || state.game.ping < 20) {
        playSynthSound('coin');
        alertBox(`Amazing Reflexes! You achieved an Elite Ping rate of ${state.game.ping} ms! +3 hours are added to PC-07 billing balance as a reward!`, "Ping Test PASSED!");

        // Add billing reward to Client PC-07
        state.activeClientPC.timeRemaining += 3 * 3600; // Add 3 hours
        updateClientBillingUI();
        renderFloorplan();
        renderOperatorStations();
    } else {
        playSynthSound('disconnect');
        alertBox(`Session timed out. Final Ping: ${state.game.ping} ms. Keep aiming faster to lower ping rates!`, "Time's Up");
    }

    resetGameUI();
}

/*
 * GENERAL HELPER UTILITIES
 */
function formatSeconds(seconds) {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function getFormattedTime() {
    const now = new Date();
    const hrs = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
}

// Background ticking timer thread for simulated PC nodes
function startUniversalBillingTicker() {
    setInterval(() => {
        let statusChanged = false;

        // Loop client PC list
        state.pcs.forEach(pc => {
            if (pc.status === 'Active' && pc.remaining > 0) {
                pc.remaining--;
                if (pc.remaining <= 0) {
                    pc.status = 'Idle';
                    pc.user = '';
                    statusChanged = true;

                    // Handle if simulator client is affected
                    if (pc.id === 'PC-07') {
                        state.activeClientPC.status = 'Idle';
                        state.activeClientPC.timeRemaining = 0;
                        updateClientBillingUI();
                        alertBox("Your simulated play time has expired. Please recharge!", "Session Expired");
                    }
                }
            }
        });

        // Ticks down client simulator separately to stay synced
        if (state.activeClientPC.status === 'Active' && state.activeClientPC.timeRemaining > 0) {
            state.activeClientPC.timeRemaining--;
            updateClientBillingUI();
        }

        // Render loops if on appropriate active screens
        if (state.currentTab === 'landing' || statusChanged) {
            renderFloorplan();
        }
        if (state.currentTab === 'operator' || statusChanged) {
            renderOperatorStations();
        }
    }, 1000);
}

/*
 * INITIALIZER ON WINDOW LOAD
 */
window.onload = function () {
    renderFloorplan();
    renderOperatorStations();
    renderWarungProducts();
    renderOperatorOrders();
    renderChatHistory();
    updateStatsDisplay();

    // Kick-off automatic background countdown billing systems
    startUniversalBillingTicker();
};
