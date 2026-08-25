// ==========================================
// NINJA BATTLE
// Telegram Mini App + Sistema de combate
// ==========================================

// Telegram WebApp
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    // Colores adaptados al tema de Telegram
    if (tg.setHeaderColor) {
        tg.setHeaderColor("#08090d");
    }

    if (tg.setBackgroundColor) {
        tg.setBackgroundColor("#08090d");
    }
}


// ==========================================
// ESTADO DEL JUGADOR
// ==========================================

const player = {
    id: null,
    name: "Ninja",
    username: "",
    level: 1,

    energy: 100,
    maxEnergy: 100,

    coins: 1250,

    totalDamage: 0
};


// ==========================================
// ESTADO DEL ENEMIGO
// ==========================================

const enemy = {
    name: "Rey de las Sombras",
    type: "JEFE",

    maxHealth: 10000,
    health: 10000
};


// ==========================================
// ELEMENTOS HTML
// ==========================================

const playerName = document.getElementById("playerName");
const playerLevel = document.getElementById("playerLevel");

const avatarLetter = document.getElementById("avatarLetter");
const menuAvatarLetter = document.getElementById("menuAvatarLetter");

const menuPlayerName = document.getElementById("menuPlayerName");
const menuPlayerLevel = document.getElementById("menuPlayerLevel");

const energyText = document.getElementById("energyText");
const energyBar = document.getElementById("energyBar");

const enemyHealthText = document.getElementById("enemyHealthText");
const enemyHealthBar = document.getElementById("enemyHealthBar");

const coinsText = document.getElementById("coinsText");

const enemyElement = document.getElementById("enemy");
const damageNumber = document.getElementById("damageNumber");

const attackButton = document.getElementById("attackButton");
const comboButton = document.getElementById("comboButton");
const criticalButton = document.getElementById("criticalButton");

const menuButton = document.getElementById("menuButton");
const closeMenu = document.getElementById("closeMenu");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");

const profileButton = document.getElementById("profileButton");
const walletButton = document.getElementById("walletButton");


// ==========================================
// TELEGRAM — IDENTIFICAR JUGADOR
// ==========================================

function loadTelegramUser() {

    if (!tg || !tg.initDataUnsafe) {
        console.log("La aplicación no está abierta desde Telegram.");
        return;
    }

    const user = tg.initDataUnsafe.user;

    if (!user) {
        console.log("No se encontró información del usuario.");
        return;
    }

    player.id = user.id || null;

    player.username = user.username || "";

    if (user.first_name) {

        player.name = user.first_name;

        if (user.last_name) {
            player.name += " " + user.last_name;
        }
    }

    updatePlayerInterface();
}


// ==========================================
// ACTUALIZAR PERFIL
// ==========================================

function updatePlayerInterface() {

    playerName.textContent = player.name;
    playerLevel.textContent = `Nivel ${player.level}`;

    menuPlayerName.textContent = player.name;
    menuPlayerLevel.textContent = `Nivel ${player.level}`;

    const letter =
        player.name
            .trim()
            .charAt(0)
            .toUpperCase() || "N";

    avatarLetter.textContent = letter;
    menuAvatarLetter.textContent = letter;
}


// ==========================================
// ACTUALIZAR ENERGÍA
// ==========================================

function updateEnergy() {

    energyText.textContent =
        `${player.energy} / ${player.maxEnergy}`;

    const percentage =
        (player.energy / player.maxEnergy) * 100;

    energyBar.style.width =
        `${Math.max(0, percentage)}%`;
}


// ==========================================
// ACTUALIZAR VIDA DEL ENEMIGO
// ==========================================

function updateEnemyHealth() {

    enemyHealthText.textContent =
        `${enemy.health.toLocaleString()} / ${enemy.maxHealth.toLocaleString()}`;

    const percentage =
        (enemy.health / enemy.maxHealth) * 100;

    enemyHealthBar.style.width =
        `${Math.max(0, percentage)}%`;
}


// ==========================================
// ACTUALIZAR MONEDAS
// ==========================================

function updateCoins() {

    coinsText.textContent =
        player.coins.toLocaleString();
}


// ==========================================
// MOSTRAR DAÑO
// =================================
