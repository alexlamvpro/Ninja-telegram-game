// ==========================================
// NINJA BATTLE - SISTEMA PRINCIPAL (PARTE 1 DE 5)
// ==========================================

const tg = window.Telegram?.WebApp;
const API_URL = "";

if (tg) {
    tg.ready();
    tg.expand();

    if (tg.setHeaderColor) tg.setHeaderColor("#07080c");
    if (tg.setBackgroundColor) tg.setBackgroundColor("#07080c");
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
// ARMAS
// ==========================================

const weapons = [
    {
        id: "kunai",
        name: "Kunai",
        price: 500,
        damage: 2,
        level: 1,
        maxLevel: 10,
        owned: true,
        equipped: true
    },
    {
        id: "katana",
        name: "Katana",
        price: 2500,
        damage: 3,
        level: 1,
        maxLevel: 15,
        upgradeTon: 0.5,
        owned: false,
        equipped: false
    },
    {
        id: "demonKatana",
        name: "Katana Demoníaca",
        price: 10000,
        damage: 4,
        level: 1,
        maxLevel: 20,
        upgradeTon: 1,
        owned: false,
        equipped: false
    },
    {
        id: "shinigamiSword",
        name: "Espada Shinigami",
        price: 35000,
        damage: 5,
        level: 1,
        maxLevel: 25,
        upgradeTon: 1.5,
        owned: false,
        equipped: false
    },
    {
        id: "voidSword",
        name: "Espada del Vacío",
        price: 100000,
        damage: 6,
        level: 1,
        maxLevel: 30,
        upgradeTon: 2,
        owned: false,
        equipped: false
    }
];

let equippedWeapon = weapons[0];

// ==========================================
// ENEMIGOS NORMALES Y ELEMENTOS HTML
// ==========================================

const normalEnemies = [
    { type: "DEMONIO", name: "Akuma Rojo", health: 100, maxHealth: 100, minDamage: 2, maxDamage: 3, reward: 100 },
    { type: "NINJA", name: "Kage Ren", health: 100, maxHealth: 100, minDamage: 2, maxDamage: 3, reward: 110 },
    { type: "SHINIGAMI", name: "Yoru", health: 120, maxHealth: 120, minDamage: 2, maxDamage: 3, reward: 110 },
    { type: "ONI", name: "Goraku", health: 130, maxHealth: 130, minDamage: 2, maxDamage: 4, reward: 120 },
    { type: "GUERRERO OSCURO", name: "Kurojin", health: 150, maxHealth: 150, minDamage: 2, maxDamage: 4, reward: 130 },
    { type: "DEMONIO", name: "Raizen", health: 180, maxHealth: 180, minDamage: 2, maxDamage: 4, reward: 140 },
    { type: "SHINIGAMI", name: "Kurohane", health: 200, maxHealth: 200, minDamage: 2, maxDamage: 4, reward: 200 }
];

let enemyIndex = 0;
let enemy = { ...normalEnemies[enemyIndex] };

const playerName = document.getElementById("playerName");
const playerLevel = document.getElementById("playerLevel");
const avatarLetter = document.getElementById("avatarLetter");
const menuAvatarLetter = document.getElementById("menuAvatarLetter");
const menuPlayerName = document.getElementById("menuPlayerName");
const menuPlayerLevel = document.getElementById("menuPlayerLevel");
const energyText = document.getElementById("energyText");
const energyBar = document.getElementById("energyBar");
const enemyType = document.getElementById("enemyType");
const enemyName = document.getElementById("enemyName");
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
const shopButton = document.getElementById("shopButton");

// ==========================================
// GUARDAR Y CARGAR PARTIDA (PARTE 2 DE 5)
// ==========================================

async function saveGame() {
    if (!player.id) {
        console.warn("No hay ID de jugador asignado. No se puede guardar.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: player.id,
                coins: player.coins,
                weapons: weapons,
                weaponLevels: weapons.map(w => w.level),
                enemyIndex: enemyIndex,
                energy: player.energy
            })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            console.error("Error al guardar:", data.error || data);
            return;
        }

        console.log("Partida guardada con éxito.");
    } catch (error) {
        console.error("Error de conexión al guardar:", error);
    }
}

async function loadGame() {
    if (!player.id) {
        console.warn("No hay ID de jugador asignado.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/load?userId=${player.id}`);
        const result = await response.json();

        if (!result.data) {
            console.log("Nuevo jugador. Creando registro inicial en D1...");
            await saveGame();
            return;
        }

        const data = result.data;

        if (data.monedas !== null && data.monedas !== undefined) player.coins = Number(data.monedas);
        if (data.energia !== null && data.energia !== undefined) player.energy = Number(data.energia);

        if (data.enemigo !== null && data.enemigo !== undefined) {
            enemyIndex = Number(data.enemigo);
            if (enemyIndex >= normalEnemies.length) enemyIndex = 0;
            enemy = { ...normalEnemies[enemyIndex] };
        }

        if (data.armas) {
            try {
                const savedWeapons = JSON.parse(data.armas);
                savedWeapons.forEach((savedWeapon, idx) => {
                    if (weapons[idx]) {
                        Object.assign(weapons[idx], savedWeapon);
                    }
                });
                
                const activeWeapon = weapons.find(w => w.equipped);
                if (activeWeapon) {
                    equippedWeapon = activeWeapon;
                }
            } catch (e) {
                console.error("Error al procesar las armas:", e);
            }
        }

        console.log("Partida cargada correctamente.");
    } catch (error) {
        console.error("Error al cargar partida desde D1:", error);
    }
}

function loadTelegramUser() {
    const user = tg?.initDataUnsafe?.user;

    if (user && user.id) {
        player.id = String(user.id);
        player.username = user.username || "";
        player.name = user.first_name || "Ninja";
        if (user.last_name) player.name += " " + user.last_name;
    } else {
        console.log("Modo desarrollo: usando ID de pruebas local.");
        player.id = "dev_user_123";
        player.name = "Ninja Tester";
    }
}

// ==========================================
// TIENDA DE ARMAS (PARTE 3 DE 5)
// ==========================================

function equipWeapon(weaponId) {
    weapons.forEach(w => {
        w.equipped = (w.id === weaponId);
        if (w.equipped) equippedWeapon = w;
    });
    saveGame();
    openWeaponShop();
}

function buyWeapon(weaponId) {
    const weapon = weapons.find(w => w.id === weaponId);
    if (!weapon) return;

    if (weapon.owned) {
        equipWeapon(weapon.id);
        return;
    }

    if (player.coins < weapon.price) {
        alert("No tienes suficientes monedas.");
        return;
    }

    player.coins -= weapon.price;
    weapon.owned = true;
    equipWeapon(weapon.id);
    updateCoins();
}

function upgradeWeapon(weaponId) {
    const weapon = weapons.find(w => w.id === weaponId);
    if (!weapon) return;

    if (!weapon.owned) {
        alert("Primero debes comprar esta arma.");
        return;
    }

    if (weapon.level >= weapon.maxLevel) {
        alert("Esta arma ya está en nivel máximo.");
        return;
    }

    if (weapon.id === "kunai") {
        const upgradeCost = 100 * Math.pow(2, weapon.level - 1);
        if (player.coins < upgradeCost) {
            alert("No tienes suficientes monedas.");
            return;
        }
        player.coins -= upgradeCost;
        updateCoins();
    }

    weapon.level += 1;
    weapon.damage += 0.5;

    saveGame();
    openWeaponShop();
}

function openWeaponShop() {
    const shop = document.getElementById("shopWeapons");
    if (!shop) return;

    shop.innerHTML = "";

    weapons.forEach((weapon) => {
        const card = document.createElement("div");
        card.className = "weapon-card";

        const isEquipped = equippedWeapon.id === weapon.id;
        const button = document.createElement("button");

        if (isEquipped) {
            button.textContent = "EQUIPADA";
            button.disabled = true;
        } else if (weapon.owned) {
            button.textContent = "EQUIPAR";
            button.onclick = () => equipWeapon(weapon.id);
        } else {
            button.textContent = `COMPRAR — 🪙 ${weapon.price}`;
            button.onclick = () => buyWeapon(weapon.id);
        }

        card.innerHTML = `
            <h3>${weapon.name}</h3>
            <p>Daño: ${weapon.damage}</p>
            <p>Nivel: ${weapon.level}/${weapon.maxLevel}</p>
        `;

        const upgradeButton = document.createElement("button");
        if (weapon.level < weapon.maxLevel) {
            if (weapon.id === "kunai") {
                const upgradeCost = 100 * Math.pow(2, weapon.level - 1);
                upgradeButton.textContent = `MEJORAR 🪙 ${upgradeCost}`;
            } else {
                upgradeButton.textContent = `MEJORAR ⚡ ${weapon.upgradeTon} TON`;
            }
            upgradeButton.onclick = () => upgradeWeapon(weapon.id);
        } else {
            upgradeButton.textContent = "NIVEL MÁXIMO";
            upgradeButton.disabled = true;
        }

        card.appendChild(upgradeButton);
        card.appendChild(button);
        shop.appendChild(card);
    });
}

function openShop() {
    const shop = document.getElementById("shop");
    if (!shop) return;
    shop.style.display = "block";
    const coins = document.getElementById("shopCoins");
    if (coins) coins.textContent = player.coins.toLocaleString();
    openWeaponShop();
}

function closeShop() {
    const shop = document.getElementById("shop");
    if (shop) shop.style.display = "none";
}

 // ==========================================
// INTERFAZ Y COMBATE (PARTE 4 DE 5)
// ==========================================

function updatePlayerInterface() {
    if (playerName) playerName.textContent = player.name;
    if (playerLevel) playerLevel.textContent = `Nivel ${player.level}`;
    if (menuPlayerName) menuPlayerName.textContent = player.name;
    if (menuPlayerLevel) menuPlayerLevel.textContent = `Nivel ${player.level}`;

    const letter = player.name.trim().charAt(0).toUpperCase() || "N";
    if (avatarLetter) avatarLetter.textContent = letter;
    if (menuAvatarLetter) menuAvatarLetter.textContent = letter;
}

function updateEnergy() {
    if (energyText) energyText.textContent = `${player.energy} / ${player.maxEnergy}`;
    const percentage = (player.energy / player.maxEnergy) * 100;
    if (energyBar) energyBar.style.width = `${Math.max(0, percentage)}%`;
}

function updateCoins() {
    if (coinsText) coinsText.textContent = player.coins.toLocaleString();
}

function updateEnemyInterface() {
    if (enemyType) enemyType.textContent = enemy.type;
    if (enemyName) enemyName.textContent = enemy.name;
    if (enemyHealthText) enemyHealthText.textContent = `${enemy.health.toLocaleString()} / ${enemy.maxHealth.toLocaleString()}`;

    const percentage = (enemy.health / enemy.maxHealth) * 100;
    if (enemyHealthBar) enemyHealthBar.style.width = `${Math.max(0, percentage)}%`;
}

function showDamage(amount, critical = false) {
    if (!damageNumber) return;

    damageNumber.textContent = critical ? `💥 ${amount}` : `-${amount}`;
    damageNumber.classList.remove("show");
    void damageNumber.offsetWidth;
    damageNumber.classList.add("show");

    damageNumber.style.color = critical ? "#ff4d5e" : "#ffcc33";
    damageNumber.style.fontSize = critical ? "38px" : "30px";
}

function enemyHitAnimation(critical = false) {
    if (!enemyElement) return;
    enemyElement.classList.remove("enemy-hit", "enemy-critical");
    void enemyElement.offsetWidth;

    enemyElement.classList.add(critical ? "enemy-critical" : "enemy-hit");
    setTimeout(() => {
        enemyElement.classList.remove("enemy-hit", "enemy-critical");
    }, 450);
}

function haptic(type = "light") {
    if (tg?.HapticFeedback) {
        try {
            if (type === "heavy") tg.HapticFeedback.impactOccurred("heavy");
            else if (type === "medium") tg.HapticFeedback.impactOccurred("medium");
            else tg.HapticFeedback.impactOccurred("light");
        } catch (e) {}
    }
}

function normalAttack() {
    const energyCost = 2;
    if (player.energy < energyCost) {
        showMessage("⚡ No tienes suficiente energía");
        haptic("light");
        return;
    }

    player.energy -= energyCost;
    const damage = equippedWeapon ? equippedWeapon.damage : 2;
    enemy.health = Math.max(0, enemy.health - damage);
    player.totalDamage += damage;

    updateEnergy();
    updateEnemyInterface();
    showDamage(damage, false);
    enemyHitAnimation(false);
    haptic("medium");

    checkEnemyDefeat();
}

function comboAttack() {
    const energyCost = 4;
    if (player.energy < energyCost) {
        showMessage("⚡ No tienes suficiente energía");
        return;
    }

    player.energy -= energyCost;
    updateEnergy();

    const hits = 3;
    for (let i = 0; i < hits; i++) {
        setTimeout(() => {
            const damage = equippedWeapon ? Math.max(1, Math.floor(equippedWeapon.damage * 0.5)) : 1;
            enemy.health = Math.max(0, enemy.health - damage);
            player.totalDamage += damage;

            updateEnemyInterface();
            showDamage(damage, false);
            enemyHitAnimation(false);
            haptic("light");

            if (i === hits - 1) checkEnemyDefeat();
        }, i * 230);
    }
}

function criticalAttack() {
    const energyCost = 8;
    if (player.energy < energyCost) {
        showMessage("⚡ No tienes suficiente energía");
        return;
    }

    player.energy -= energyCost;
    updateEnergy();

    const damage = equippedWeapon ? Math.floor(equippedWeapon.damage * 3) : 10;
    enemy.health = Math.max(0, enemy.health - damage);
    player.totalDamage += damage;

    updateEnemyInterface();
    showDamage(damage, true);
    enemyHitAnimation(true);
    haptic("heavy");

    checkEnemyDefeat();
}

// ==========================================
// FLUJO DE JUEGO, MENÚ E INICIALIZACIÓN (PARTE 5 DE 5)
// ==========================================

function checkEnemyDefeat() {
    if (enemy.health > 0) return;

    disableAttacks();

    setTimeout(() => {
        const reward = enemy.reward;
        player.coins += reward;
        updateCoins();
        showMessage(`💰 +${reward} monedas`);

        setTimeout(() => {
            nextEnemy();
        }, 900);
    }, 450);
}

function nextEnemy() {
    enemyIndex++;
    if (enemyIndex >= normalEnemies.length) enemyIndex = 0;

    enemy = { ...normalEnemies[enemyIndex] };

    updateEnemyInterface();
    enableAttacks();
    saveGame();
    showMessage(`${enemy.type}: ${enemy.name}`);
}

function disableAttacks() {
    if (attackButton) attackButton.disabled = true;
    if (comboButton) comboButton.disabled = true;
    if (criticalButton) criticalButton.disabled = true;
}

function enableAttacks() {
    if (attackButton) attackButton.disabled = false;
    if (comboButton) comboButton.disabled = false;
    if (criticalButton) criticalButton.disabled = false;
}

let messageTimeout;
function showMessage(text) {
    let message = document.getElementById("gameMessage");
    if (!message) {
        message = document.createElement("div");
        message.id = "gameMessage";
        message.style.position = "fixed";
        message.style.left = "50%";
        message.style.top = "50%";
        message.style.transform = "translate(-50%, -50%)";
        message.style.zIndex = "200";
        message.style.padding = "12px 18px";
        message.style.borderRadius = "14px";
        message.style.background = "rgba(10,12,18,.94)";
        message.style.border = "1px solid rgba(255,255,255,.12)";
        message.style.fontWeight = "800";
        message.style.fontSize = "13px";
        message.style.textAlign = "center";
        document.body.appendChild(message);
    }

    message.textContent = text;
    message.style.opacity = "1";
    clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        message.style.opacity = "0";
    }, 1300);
}

function openMenu() {
    sideMenu?.classList.add("open");
    menuOverlay?.classList.add("open");
}

function closeSideMenu() {
    sideMenu?.classList.remove("open");
    menuOverlay?.classList.remove("open");
}

function menuMessage(text) {
    closeSideMenu();
    showMessage(text);
}

// Event Listeners
attackButton?.addEventListener("click", normalAttack);
comboButton?.addEventListener("click", comboAttack);
criticalButton?.addEventListener("click", criticalAttack);

menuButton?.addEventListener("click", openMenu);
closeMenu?.addEventListener("click", closeSideMenu);
menuOverlay?.addEventListener("click", closeSideMenu);

profileButton?.addEventListener("click", () => showMessage(`👤 ${player.name}`));
walletButton?.addEventListener("click", () => showMessage("💰 Wallet próximamente"));
shopButton?.addEventListener("click", openShop);

document.getElementById("profileMenuOption")?.addEventListener("click", () => menuMessage("👤 Perfil"));
document.getElementById("settingsMenuOption")?.addEventListener("click", () => menuMessage("⚙️ Ajustes próximamente"));
document.getElementById("rewardsMenuOption")?.addEventListener("click", () => menuMessage("🎁 Recompensas próximamente"));
document.getElementById("adsMenuOption")?.addEventListener("click", () => menuMessage("📺 Anuncios próximamente"));
document.getElementById("referralsMenuOption")?.addEventListener("click", () => menuMessage("👥 Sistema de referidos"));
document.getElementById("partnersMenuOption")?.addEventListener("click", () => menuMessage("🤝 Socios próximamente"));
document.getElementById("missionsMenuOption")?.addEventListener("click", () => menuMessage("🎯 Misiones próximamente"));
document.getElementById("walletMenuOption")?.addEventListener("click", () => menuMessage("💰 Wallet TON próximamente"));

// Recarga periódica de energía (cada 60 segundos)
setInterval(() => {
    if (player.energy < player.maxEnergy) {
        player.energy++;
        updateEnergy();
        saveGame();
    }
}, 60000);

// Inicialización de la aplicación
async function initGame() {
    loadTelegramUser();
    await loadGame();

    updatePlayerInterface();
    updateEnergy();
    updateCoins();
    updateEnemyInterface();
    enableAttacks();

    console.log("Ninja Battle iniciado correctamente.");
}

// Escuchador para arrancar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initGame);
