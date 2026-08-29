// ==========================================
// NINJA BATTLE
// SISTEMA PRINCIPAL
// ==========================================

const tg = window.Telegram?.WebApp;

const API_URL =
    "https://ninja-telegram-game.gustavocameda1.workers.dev";

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
        owned: true
    },

    {
        id: "katana",
        name: "Katana",
        price: 2500,
        damage: 3,
        level: 1,
        maxLevel: 15,
        upgradeTon: 0.5,
        owned: false
    },

    {
        id: "demonKatana",
        name: "Katana Demoníaca",
        price: 10000,
        damage: 4,
        level: 1,
        maxLevel: 20,
        upgradeTon: 1,
        owned: false
    },

    {
        id: "shinigamiSword",
        name: "Espada Shinigami",
        price: 35000,
        damage: 5,
        level: 1,
        maxLevel: 25,
        upgradeTon: 1.5,
        owned: false
    },

    {
        id: "voidSword",
        name: "Espada del Vacío",
        price: 100000,
        damage: 6,
        level: 1,
        maxLevel: 30,
        upgradeTon: 2,
        owned: false
    }

];

// ==========================================
// GUARDAR PARTIDA
// ==========================================

async function saveGame() {

    if (!player.id) {
        alert("ERROR: No se encontró el ID de Telegram.");
        console.log("No hay ID de jugador.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/save`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userId: player.id,
                    coins: player.coins,
                    weapons: weapons,
                    weaponLevels: weapons.map(
                        weapon => weapon.level
                    )
                })
            }
        );

        const data = await response.json();

        console.log("Respuesta del guardado:", data);

        if (!response.ok || !data.success) {
            alert(
                "ERROR AL GUARDAR:\n" +
                (data.error || JSON.stringify(data))
            );
            return;
        }

        console.log("Partida guardada correctamente:", data);

    } catch (error) {

        console.error(
            "Error al guardar la partida:",
            error
        );

        alert(
            "ERROR DE CONEXIÓN:\n" +
            error.message
        );
    }
}


// ==========================================
// CARGAR PARTIDA
// ==========================================

async function loadGame() {

    if (!player.id) {
        console.log("No hay ID de jugador.");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/load?userId=${player.id}`
        );

        const result = await response.json();

        // Si el jugador todavía no tiene partida
        if (!result.data) {

            console.log(
                "Jugador nuevo. Se usarán los datos iniciales."
            );

            await saveGame();

            return;
        }

        const data = result.data;

        // Cargar monedas
        if (data.monedas !== null) {

            player.coins =
                Number(data.monedas);
        }

        // Cargar armas
        if (data.armas) {

            const savedWeapons =
                JSON.parse(data.armas);

            savedWeapons.forEach(
                (savedWeapon, index) => {

                    if (!weapons[index]) {
                        return;
                    }

                    weapons[index] = {
                        ...weapons[index],
                        ...savedWeapon
                    };
                }
            );
        }

        updateCoins();

        console.log(
            "Partida cargada correctamente."
        );

    } catch (error) {

        console.error(
            "Error al cargar la partida:",
            error
        );
    }
}

// ==========================================
// ARMA EQUIPADA
// ==========================================

let equippedWeapon =
    weapons[0];

// ==========================================
// TIENDA DE ARMAS
// ==========================================

function openWeaponShop() {

    const shop = document.getElementById("shopWeapons");

    if (!shop) {
        console.error("No se encontró el elemento #shop");
        return;
    }

    shop.innerHTML = "";

    weapons.forEach((weapon) => {

        const card = document.createElement("div");

        card.className = "weapon-card";

        const isEquipped =
            equippedWeapon.id === weapon.id;

        const button = document.createElement("button");

        if (isEquipped) {

            button.textContent = "EQUIPADA";
            button.disabled = true;

        } else if (weapon.owned) {

            button.textContent = "EQUIPAR";

            button.onclick = () => {

                equippedWeapon = weapon;

                openWeaponShop();

            };

        } else {

            button.textContent =
                `COMPRAR — 🪙 ${weapon.price}`;

            button.onclick = () => {

                buyWeapon(weapon.id);

            };

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

    upgradeButton.onclick = () => {
        upgradeWeapon(weapon.id);
    };
} else {
    upgradeButton.textContent = "NIVEL MÁXIMO";
    upgradeButton.disabled = true;
}

card.appendChild(upgradeButton);
        card.appendChild(button);

        shop.appendChild(card);

    });

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

        // Costo de mejora solo para la Kunai
    if (weapon.id === "kunai") {

        const upgradeCost = 100 * Math.pow(2, weapon.level - 1);

        if (player.coins < upgradeCost) {
            alert("No tienes suficientes monedas.");
            return;
        }

        player.coins -= upgradeCost;
     }

    // Subir un nivel
    weapon.level += 1;

    // Aumentar el daño en 1 punto
    weapon.damage += 0.5;

    // Guardar la partida
    saveGame();
    
    // Actualizar la tienda
    openWeaponShop();
    
            }

// ==========================================
// COMPRAR ARMA
// ==========================================

function buyWeapon(weaponId) {

    const weapon =
        weapons.find(w => w.id === weaponId);

    if (!weapon) return;

    if (weapon.owned) {

        equippedWeapon = weapon;

        openWeaponShop();

        return;

    }

    if (player.coins < weapon.price) {

        alert("No tienes suficientes monedas.");

        return;

    }

    player.coins -= weapon.price;

    weapon.owned = true;

    equippedWeapon = weapon;

    saveGame();
    
    openWeaponShop();

}

// ==========================================
// ABRIR Y CERRAR TIENDA
// ==========================================

function openShop() {
    const shop = document.getElementById("shop");

    if (!shop) return;

    shop.style.display = "block";

    const coins = document.getElementById("shopCoins");

    if (coins) {
        coins.textContent = player.coins;
    }

    openWeaponShop();
}

function closeShop() {
    const shop = document.getElementById("shop");

    if (!shop) return;

    shop.style.display = "none";
}


// ==========================================
// ENEMIGOS NORMALES
// ==========================================

const normalEnemies = [

    {
        type: "DEMONIO",
        name: "Akuma Rojo",
        health: 100,
        maxHealth: 100,
        minDamage: 2,
        maxDamage: 3,
        reward: 100
    },

    {
        type: "NINJA",
        name: "Kage Ren",
        health: 100,
        maxHealth: 100,
        minDamage: 2,
        maxDamage: 3,
        reward: 110
    },

    {
        type: "SHINIGAMI",
        name: "Yoru",
        health: 120,
        maxHealth: 120,
        minDamage: 2,
        maxDamage: 3,
        reward: 110
    },

    {
        type: "ONI",
        name: "Goraku",
        health: 130,
        maxHealth: 130,
        minDamage: 2,
        maxDamage: 4,
        reward: 120
    },

    {
        type: "GUERRERO OSCURO",
        name: "Kurojin",
        health: 150,
        maxHealth: 150,
        minDamage: 2,
        maxDamage: 4,
        reward: 130
    },

    {
        type: "DEMONIO",
        name: "Raizen",
        health: 180,
        maxHealth: 180,
        minDamage: 2,
        maxDamage: 4,
        reward: 140
    },

    {
        type: "SHINIGAMI",
        name: "Kurohane",
        health: 200,
        maxHealth: 200,
        minDamage: 2,
        maxDamage: 4,
        reward: 200
    }

];


// ==========================================
// ENEMIGO ACTUAL
// ==========================================

let enemyIndex = 0;

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

async function loadTelegramUser() {

    if (!tg) {
        return;
    }

    const user =
        tg.initDataUnsafe?.user;

    if (!user) {
        console.log(
            "No se encontraron datos de Telegram."
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

await loadGame();
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
// MOSTRAR DAÑO
// ==========================================

function showDamage(amount, critical = false) {

    damageNumber.textContent =
        critical
            ? `💥 ${amount}`
            : `-${amount}`;

    damageNumber.classList.remove("show");

    void damageNumber.offsetWidth;

    damageNumber.classList.add("show");

    if (critical) {

        damageNumber.style.color =
            "#ff4d5e";

        damageNumber.style.fontSize =
            "38px";

    } else {

        damageNumber.style.color =
            "#ffcc33";

        damageNumber.style.fontSize =
            "30px";
    }
}


// ==========================================
// ANIMACIÓN DE GOLPE
// ==========================================

function enemyHitAnimation(critical = false) {

    enemyElement.classList.remove(
        "enemy-hit",
        "enemy-critical"
    );

    void enemyElement.offsetWidth;

    if (critical) {

        enemyElement.classList.add(
            "enemy-critical"
        );

    } else {

        enemyElement.classList.add(
            "enemy-hit"
        );
    }

    setTimeout(() => {

        enemyElement.classList.remove(
            "enemy-hit",
            "enemy-critical"
        );

    }, 450);
}


// ==========================================
// SONIDO / VIBRACIÓN
// ==========================================

function haptic(type = "light") {

    if (
        tg &&
        tg.HapticFeedback
    ) {

        try {

            if (type === "heavy") {

                tg.HapticFeedback
                    .impactOccurred("heavy");

            } else if (type === "medium") {

                tg.HapticFeedback
                    .impactOccurred("medium");

            } else {

                tg.HapticFeedback
                    .impactOccurred("light");
            }

        } catch (error) {

            console.log(
                "Haptic no disponible."
            );
        }
    }
}


// ==========================================
// ATAQUE NORMAL
// ==========================================

function normalAttack() {

    const energyCost = 2;
     
    if (
        player.energy <
        energyCost
    ) {

        showMessage(
            "⚡ No tienes suficiente energía"
        );

        haptic("light");

        return;
    }

    player.energy -=
        energyCost;

    const damage = equippedWeapon ? equippedWeapon.damage : 2;

    enemy.health -=
        damage;

    if (enemy.health < 0) {
        enemy.health = 0;
    }

    player.totalDamage +=
        damage;

    updateEnergy();

    updateEnemyInterface();

    showDamage(
        damage,
        false
    );

    enemyHitAnimation(
        false
    );

    haptic("medium");

    checkEnemyDefeat();
}


// ==========================================
// COMBO
// ==========================================

function comboAttack() {

    const energyCost = 4; 

    if (
        player.energy <
        energyCost
    ) {

        showMessage(
            "⚡ No tienes suficiente energía"
        );

        return;
    }

    player.energy -=
        energyCost;

    updateEnergy();

    const hits = 3;

    let totalDamage = 0;

    for (
        let i = 0;
        i < hits;
        i++
    ) {

        setTimeout(() => {

            const damage = equippedWeapon ? equippedWeapon.damage * 0.5 : 1;
                

            enemy.health -=
                damage;

            if (
                enemy.health < 0
            ) {

                enemy.health = 0;
            }

            totalDamage +=
                damage;

            player.totalDamage +=
                damage;

            updateEnemyInterface();

            showDamage(
                damage,
                false
            );

            enemyHitAnimation(
                false
            );

            haptic("light");

            if (
                i === hits - 1
            ) {

                checkEnemyDefeat();
            }

        }, i * 230);
    }
}


// ==========================================
// ATAQUE CRÍTICO
// ==========================================

function criticalAttack() {

    const energyCost = 8;

    if (
        player.energy <
        energyCost
    ) {

        showMessage(
            "⚡ No tienes suficiente energía"
        );

        return;
    }

    player.energy -=
        energyCost;

    updateEnergy();

    const damage = equippedWeapon ? equippedWeapon.damage * 3 : 10;
        

    enemy.health -=
        damage;

    if (
        enemy.health < 0
    ) {

        enemy.health = 0;
    }

    player.totalDamage +=
        damage;

    updateEnemyInterface();

    showDamage(
        damage,
        true
    );

    enemyHitAnimation(
        true
    );

    haptic("heavy");

    checkEnemyDefeat();
}


// ==========================================
// COMPROBAR DERROTA
// ==========================================

function checkEnemyDefeat() {

    if (
        enemy.health > 0
    ) {

        return;
    }

    disableAttacks();

    setTimeout(() => {

        const reward =
            enemy.reward;

        player.coins +=
            reward;

        updateCoins();
        saveGame();
        showMessage(
            `💰 +${reward} monedas`
        );

        setTimeout(() => {

            nextEnemy();

        }, 900);

    }, 450);
}


// ==========================================
// SIGUIENTE ENEMIGO
// ==========================================

function nextEnemy() {

    enemyIndex++;

    if (
        enemyIndex >=
        normalEnemies.length
    ) {

        enemyIndex = 0;
    }

    enemy = {
        ...normalEnemies[enemyIndex]
    };

    updateEnemyInterface();

    enableAttacks();

    showMessage(
        `${enemy.type}: ${enemy.name}`
    );
}


// ==========================================
// ACTIVAR / DESACTIVAR ATAQUES
// ==========================================

function disableAttacks() {

    attackButton.disabled = true;

    comboButton.disabled = true;

    criticalButton.disabled = true;
}

function enableAttacks() {

    attackButton.disabled = false;

    comboButton.disabled = false;

    criticalButton.disabled = false;
}


// ==========================================
// NÚMERO ALEATORIO
// ==========================================

function randomNumber(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;
}


// ==========================================
// MENSAJE TEMPORAL
// ==========================================

let messageTimeout;

function showMessage(text) {

    let message =
        document.getElementById(
            "gameMessage"
        );

    if (!message) {

        message =
            document.createElement(
                "div"
            );

        message.id =
            "gameMessage";

        message.style.position =
            "fixed";

        message.style.left =
            "50%";

        message.style.top =
            "50%";

        message.style.transform =
            "translate(-50%, -50%)";

        message.style.zIndex =
            "200";

        message.style.padding =
            "12px 18px";

        message.style.borderRadius =
            "14px";

        message.style.background =
            "rgba(10,12,18,.94)";

        message.style.border =
            "1px solid rgba(255,255,255,.12)";

        message.style.fontWeight =
            "800";

        message.style.fontSize =
            "13px";

        message.style.textAlign =
            "center";

        document.body.appendChild(
            message
        );
    }

    message.textContent =
        text;

    message.style.opacity =
        "1";

    clearTimeout(
        messageTimeout
    );

    messageTimeout =
        setTimeout(() => {

            message.style.opacity =
                "0";

        }, 1300);
}


// ==========================================
// MENÚ
// ==========================================

function openMenu() {

    sideMenu.classList.add(
        "open"
    );

    menuOverlay.classList.add(
        "open"
    );
}

function closeSideMenu() {

    sideMenu.classList.remove(
        "open"
    );

    menuOverlay.classList.remove(
        "open"
    );
}


// ==========================================
// BOTONES DEL MENÚ
// ==========================================

function menuMessage(text) {

    closeSideMenu();

    showMessage(text);
}

document
    .getElementById(
        "profileMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "👤 Perfil"
        )
    );

document
    .getElementById(
        "settingsMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "⚙️ Ajustes próximamente"
        )
    );

document
    .getElementById(
        "rewardsMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "🎁 Recompensas próximamente"
        )
    );

document
    .getElementById(
        "adsMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "📺 Anuncios próximamente"
        )
    );

document
    .getElementById(
        "referralsMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "👥 Sistema de referidos"
        )
    );
// ==========================================
// RESTO DEL MENÚ
// ==========================================

document
    .getElementById(
        "partnersMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "🤝 Socios próximamente"
        )
    );

document
    .getElementById(
        "missionsMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "🎯 Misiones próximamente"
        )
    );

document
    .getElementById(
        "walletMenuOption"
    )
    ?.addEventListener(
        "click",
        () => menuMessage(
            "💰 Wallet TON próximamente"
        )
    );


// ==========================================
// EVENTOS DE ATAQUE
// ==========================================

attackButton.addEventListener(
    "click",
    normalAttack
);

comboButton.addEventListener(
    "click",
    comboAttack
);

criticalButton.addEventListener(
    "click",
    criticalAttack
);


// ==========================================
// EVENTOS DEL MENÚ
// ==========================================

menuButton.addEventListener(
    "click",
    openMenu
);

closeMenu.addEventListener(
    "click",
    closeSideMenu
);

menuOverlay.addEventListener(
    "click",
    closeSideMenu
);


// ==========================================
// PERFIL
// ==========================================

profileButton.addEventListener(
    "click",
    () => {

        showMessage(
            `👤 ${player.name}`
        );

    }
);


// ==========================================
// WALLET
// ==========================================

walletButton.addEventListener(
    "click",
    () => {

        showMessage(
            "💰 Wallet próximamente"
        );

    }
);


// ==========================================
// TIENDA
// ==========================================

shopButton.addEventListener(
    "click",
    openShop
);

// ==========================================
// RECARGA DE ENERGÍA
// ==========================================

setInterval(() => {

    if (
        player.energy <
        player.maxEnergy
    ) {

        player.energy++;

        updateEnergy();
    }

}, 3000);


// ==========================================
// INICIALIZACIÓN
// ==========================================

function initGame() {

    loadTelegramUser();

    updatePlayerInterface();

    updateEnergy();

    updateCoins();

    updateEnemyInterface();

    enableAttacks();

    console.log(
        "Ninja Battle iniciado."
    );
}


// ==========================================
// INICIAR
// ==========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initGame
    );

} else {

    initGame();
}
