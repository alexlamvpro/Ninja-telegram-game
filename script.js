// ==========================================
// NINJA BATTLE
// Telegram Mini App
// Sistema principal de combate
// ==========================================


// ==========================================
// TELEGRAM
// ==========================================

const tg = window.Telegram?.WebApp;

if (tg) {

    tg.ready();
    tg.expand();

    if (tg.setHeaderColor) {
        tg.setHeaderColor("#07080c");
    }

    if (tg.setBackgroundColor) {
        tg.setBackgroundColor("#07080c");
    }
}


// ==========================================
// JUGADOR
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
// ENEMIGOS NORMALES
// ==========================================
//
// Los jefes NO están aquí.
// Los jefes estarán reservados para
// el evento especial de cada 10 días.
//

const normalEnemies = [

    {
        type: "DEMONIO",
        name: "Akuma Rojo",
        health: 5000,
        maxHealth: 5000,
        minDamage: 80,
        maxDamage: 130,
        reward: 180
    },

    {
        type: "NINJA",
        name: "Kage Ren",
        health: 5500,
        maxHealth: 5500,
        minDamage: 90,
        maxDamage: 140,
        reward: 210
    },

    {
        type: "SHINIGAMI",
        name: "Yoru",
        health: 6000,
        maxHealth: 6000,
        minDamage: 100,
        maxDamage: 150,
        reward: 240
    },

    {
        type: "ONI",
        name: "Goraku",
        health: 7000,
        maxHealth: 7000,
        minDamage: 110,
        maxDamage: 165,
        reward: 280
    },

    {
        type: "GUERRERO OSCURO",
        name: "Kurojin",
        health: 7500,
        maxHealth: 7500,
        minDamage: 120,
        maxDamage: 180,
        reward: 320
    },

    {
        type: "DEMONIO",
        name: "Raizen",
        health: 8000,
        maxHealth: 8000,
        minDamage: 125,
        maxDamage: 190,
        reward: 360
    },

    {
        type: "SHINIGAMI",
        name: "Kurohane",
        health: 8500,
        maxHealth: 8500,
        minDamage: 130,
        maxDamage: 200,
        reward: 400
    }

];


// ==========================================
// ÍNDICE DEL ENEMIGO
// ==========================================

let enemyIndex = 0;


// ==========================================
// ENEMIGO ACTUAL
// ==========================================

let enemy = {
    ...normalEnemies[enemyIndex]
};


// ==========================================
// ELEMENTOS HTML
// ==========================================

const playerName =
    document.getElementById("playerName");

const playerLevel =
    document.getElementById("playerLevel");

const avatarLetter =
    document.getElementById("avatarLetter");

const menuAvatarLetter =
    document.getElementById("menuAvatarLetter");

const menuPlayerName =
    document.getElementById("menuPlayerName");

const menuPlayerLevel =
    document.getElementById("menuPlayerLevel");

const energyText =
    document.getElementById("energyText");

const energyBar =
    document.getElementById("energyBar");

const enemyType =
    document.getElementById("enemyType");

const enemyName =
    document.getElementById("enemyName");

const enemyHealthText =
    document.getElementById("enemyHealthText");

const enemyHealthBar =
    document.getElementById("enemyHealthBar");

const coinsText =
    document.getElementById("coinsText");

const enemyElement =
    document.getElementById("enemy");

const damageNumber =
    document.getElementById("damageNumber");

const attackButton =
    document.getElementById("attackButton");

const comboButton =
    document.getElementById("comboButton");

const criticalButton =
    document.getElementById("criticalButton");

const menuButton =
    document.getElementById("menuButton");

const closeMenu =
    document.getElementById("closeMenu");

const sideMenu =
    document.getElementById("sideMenu");

const menuOverlay =
    document.getElementById("menuOverlay");

const profileButton =
    document.getElementById("profileButton");

const walletButton =
    document.getElementById("walletButton");

const shopButton =
    document.getElementById("shopButton");


// ==========================================
// DATOS DE TELEGRAM
// ==========================================

function loadTelegramUser() {

    if (!tg) {
        return;
    }

    const user =
        tg.initDataUnsafe?.user;

    if (!user) {
        console.log(
            "No se encontraron datos del usuario de Telegram."
        );

        return;
    }

    player.id =
        user.id || null;

    player.username =
        user.username || "";

    if (user.first_name) {

        player.name =
            user.first_name;

        if (user.last_name) {

            player.name +=
                " " + user.last_name;
        }
    }

    updatePlayerInterface();
}


// ==========================================
// INTERFAZ DEL JUGADOR
// ==========================================

function updatePlayerInterface() {

    playerName.textContent =
        player.name;

    playerLevel.textContent =
        `Nivel ${player.level}`;

    menuPlayerName.textContent =
        player.name;

    menuPlayerLevel.textContent =
        `Nivel ${player.level}`;

    const letter =
        player.name
            .trim()
            .charAt(0)
            .toUpperCase() || "N";

    avatarLetter.textContent =
        letter;

    menuAvatarLetter.textContent =
        letter;
}


// ==========================================
// ENERGÍA
// ==========================================

function updateEnergy() {

    energyText.textContent =
        `${player.energy} / ${player.maxEnergy}`;

    const percentage =
        (player.energy /
            player.maxEnergy) * 100;

    energyBar.style.width =
        `${Math.max(0, percentage)}%`;
}


// ==========================================
// MONEDAS
// ==========================================

function updateCoins() {

    coinsText.textContent =
        player.coins.toLocaleString();
}


// ==========================================
// ENEMIGO
// ==========================================

function updateEnemyInterface() {

    enemyType.textContent =
        enemy.type;

    enemyName.textContent =
        enemy.name;

    enemyHealthText.textContent =
        `${enemy.health.toLocaleString()} / ${enemy.maxHealth.toLocaleString()}`;

    const percentage =
        (enemy.health /
            enemy.maxHealth) * 100;

    enemyHealthBar.style.width =
        `${Math.max(0, percentage)}%`;
}


// ==========================================
// NÚMERO ALEATORIO
// ==========================================

function randomNumber(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


// ==========================================
// MOSTRAR DAÑO
// ==========================================

function showDamage(
    amount,
    critical = false
) {

    damageNumber.textContent =
        critical
            ? `💥 -${amount}`
            : `-${amount}`;

    damageNumber.classList.remove(
        "show"
    );

    void damageNumber.offsetWidth;

    damageNumber.classList.add(
        "show"
    );
}


// ==========================================
// ANIMACIÓN DE GOLPE
// ==========================================

function normalHitAnimation() {

    if (!enemyElement) {
        return;
    }

    enemyElement.animate(

        [

            {
                transform:
                    "translateX(0) scale(1)"
            },

            {
                transform:
                    "translateX(-14px) scale(1.04)"
            },

            {
               
