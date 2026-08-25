/* =========================================================
   NINJA - MOTOR PRINCIPAL DEL JUEGO
   Primera versión: HTML + CSS + JavaScript puro
========================================================= */


/* =========================================================
   DATOS DEL JUGADOR
========================================================= */

const player = {

  id: null,

  name: "Ninja",

  level: 1,

  coins: 1250,

  energy: 100,

  maxEnergy: 100,

  totalDamage: 0,

  weapons: [],

  upgrades: []

};


/* =========================================================
   DATOS DEL ENEMIGO
========================================================= */

const boss = {

  id: 1,

  name: "REY DE LAS SOMBRAS",

  level: 5,

  maxHealth: 10000,

  health: 10000,

  defense: 0

};


/* =========================================================
   CONFIGURACIÓN DE ATAQUES
========================================================= */

const attacks = {

  normal: {

    name: "ATAQUE",

    energyCost: 2,

    baseDamage: 120,

    multiplier: 1,

    type: "normal"

  },

  combo: {

    name: "COMBO",

    energyCost: 4,

    baseDamage: 70,

    multiplier: 3,

    type: "combo"

  },

  critical: {

    name: "CRÍTICO",

    energyCost: 8,

    baseDamage: 180,

    multiplier: 2,

    criticalChance: 0.35,

    criticalMultiplier: 2,

    type: "critical"

  }

};


/* =========================================================
   RECUPERACIÓN DE ENERGÍA
========================================================= */

const ENERGY_RECOVERY_SECONDS = 5;

let energyRecoveryTimer = ENERGY_RECOVERY_SECONDS;


/* =========================================================
   REFERENCIAS HTML
========================================================= */

const elements = {

  playerName: document.getElementById("playerName"),

  playerLevel: document.getElementById("playerLevel"),

  coins: document.getElementById("coins"),

  energy: document.getElementById("energy"),

  energyBar: document.getElementById("energyBar"),

  recoveryTimer: document.getElementById("recoveryTimer"),

  bossName: document.getElementById("bossName"),

  bossLevel: document.getElementById("bossLevel"),

  bossHealth: document.getElementById("bossHealth"),

  bossMaxHealth: document.getElementById("bossMaxHealth"),

  bossHealthBar: document.getElementById("bossHealthBar"),

  enemy: document.getElementById("enemy"),

  damageContainer: document.getElementById("damageContainer"),

  menuButton: document.getElementById("menuButton"),

  sideMenu: document.getElementById("sideMenu"),

  closeMenu: document.getElementById("closeMenu"),

  overlay: document.getElementById("overlay"),

  comboButton: document.getElementById("comboButton"),

  attackButton: document.getElementById("attackButton"),

  criticalButton: document.getElementById("criticalButton"),

  eventCountdown: document.getElementById("eventCountdown")

};


/* =========================================================
   INICIALIZACIÓN
========================================================= */

function init() {

  updatePlayerUI();

  updateBossUI();

  updateAttackButtons();

  setupMenu();

  setupCombat();

  startEnergyRecovery();

  setupSupremeBossPreview();

}


/* =========================================================
   ACTUALIZAR JUGADOR
========================================================= */

function updatePlayerUI() {

  elements.playerName.textContent = player.name;

  elements.playerLevel.textContent = player.level;

  elements.coins.textContent =
    player.coins.toLocaleString("es-MX");

  elements.energy.textContent = player.energy;

  const energyPercentage =
    (player.energy / player.maxEnergy) * 100;

  elements.energyBar.style.width =
    `${energyPercentage}%`;

}


/* =========================================================
   ACTUALIZAR JEFE
========================================================= */

function updateBossUI() {

  elements.bossName.textContent = boss.name;

  elements.bossLevel.textContent = boss.level;

  elements.bossHealth.textContent =
    Math.max(0, Math.floor(boss.health)).toLocaleString("es-MX");

  elements.bossMaxHealth.textContent =
    boss.maxHealth.toLocaleString("es-MX");

  const percentage =
    Math.max(0, (boss.health / boss.maxHealth) * 100);

  elements.bossHealthBar.style.width =
    `${percentage}%`;

}


/* =========================================================
   CONFIGURAR BOTONES
========================================================= */

function setupCombat() {

  elements.attackButton.addEventListener(
    "click",
    () => performAttack(attacks.normal)
  );

  elements.comboButton.addEventListener(
    "click",
    () => performAttack(attacks.combo)
  );

  elements.criticalButton.addEventListener(
    "click",
    () => performAttack(attacks.critical)
  );

}


/* =========================================================
   ATAQUE
========================================================= */

function performAttack(attack) {

  if (player.energy < attack.energyCost) {

    showDamageText(
      "⚡ SIN ENERGÍA",
      "critical"
    );

    return;
  }


  if (boss.health <= 0) {

    return;
  }


  // Gastar energía
  player.energy -= attack.energyCost;


  // Calcular daño
  let damage =
    attack.baseDamage * attack.multiplier;


  let isCritical = false;


  // Probabilidad de crítico
  if (
    attack.type === "critical" &&
    Math.random() < attack.criticalChance
  ) {

    damage *= attack.criticalMultiplier;

    isCritical = true;
  }


  // Aplicar defensa del jefe
  damage = Math.max(
    1,
    Math.floor(damage - boss.defense)
  );


  // Evitar daño superior a la vida restante
  damage = Math.min(
    damage,
    boss.health
  );


  // Restar vida
  boss.health -= damage;


  // Registrar daño del jugador
  player.totalDamage += damage;


  // Mostrar animación
  animateEnemy();

  showDamageText(
    `-${damage.toLocaleString("es-MX")}`,
    isCritical
      ? "critical"
      : attack.type === "combo"
        ? "combo"
        : ""
  );


  // Actualizar pantalla
  updatePlayerUI();

  updateBossUI();

  updateAttackButtons();


  // Comprobar si murió
  if (boss.health <= 0) {

    bossDefeated();

  }

}


/* =========================================================
   JEFE DERROTADO
========================================================= */

function bossDefeated() {

  boss.health = 0;

  updateBossUI();

  showDamageText(
    "👹 ¡JEFE DERROTADO!",
    "critical"
  );


  setTimeout(() => {

    alert(
      "¡Victoria! El jefe ha sido derrotado."
    );

  }, 300);

}


/* =========================================================
   ANIMACIÓN DEL ENEMIGO
========================================================= */

function animateEnemy() {

  elements.enemy.classList.remove("hit");

  // Reiniciar animación
  void elements.enemy.offsetWidth;

  elements.enemy.classList.add("hit");

}


/* =========================================================
   NÚMEROS DE DAÑO
========================================================= */

function showDamageText(text, type = "") {

  const damage = document.createElement("div");

  damage.className = `damage-number ${type}`;

  damage.textContent = text;


  const randomX =
    45 + Math.random() * 10;

  const randomY =
    40 + Math.random() * 15;

  damage.style.left = `${randomX}%`;

  damage.style.top = `${randomY}%`;


  elements.damageContainer.appendChild(damage);


  setTimeout(() => {

    damage.remove();

  }, 850);

}


/* =========================================================
   BOTONES DE ATAQUE
========================================================= */

function updateAttackButtons() {

  elements.attackButton.disabled =
    player.energy < attacks.normal.energyCost ||
    boss.health <= 0;

  elements.comboButton.disabled =
    player.energy < attacks.combo.energyCost ||
    boss.health <= 0;

  elements.criticalButton.disabled =
    player.energy < attacks.critical.energyCost ||
    boss.health <= 0;

}


/* =========================================================
   RECUPERACIÓN DE ENERGÍA
========================================================= */

function startEnergyRecovery() {

  setInterval(() => {

    if (player.energy < player.maxEnergy) {

      energyRecoveryTimer--;

      if (energyRecoveryTimer <= 0) {

        player.energy++;

        energyRecoveryTimer =
          ENERGY_RECOVERY_SECONDS;

        updatePlayerUI();

        updateAttackButtons();

      }

    } else {

      energyRecoveryTimer =
        ENERGY_RECOVERY_SECONDS;

    }


    updateRecoveryTimer();

  }, 1000);

}


/* =========================================================
   TEMPORIZADOR DE ENERGÍA
========================================================= */

function updateRecoveryTimer() {

  if (player.energy >= player.maxEnergy) {

    elements.recoveryTimer.textContent =
      "COMPLETA";

    return;
  }


  const minutes =
    Math.floor(energyRecoveryTimer / 60);

  const seconds =
    energyRecoveryTimer % 60;


  elements.recoveryTimer.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* =========================================================
   MENÚ
========================================================= */

function setupMenu() {

  elements.menuButton.addEventListener(
    "click",
    openMenu
  );

  elements.closeMenu.addEventListener(
    "click",
    closeMenu
  );

  elements.overlay.addEventListener(
    "click",
    closeMenu
  );

}


function openMenu() {

  elements.sideMenu.classList.add("open");

  elements.overlay.classList.add("visible");

}


function closeMenu() {

  elements.sideMenu.classList.remove("open");

  elements.overlay.classList.remove("visible");

}


/* =========================================================
   EVENTO JEFE SUPREMO
========================================================= */

/*
   ESTA FUNCIÓN ES SOLO LA BASE VISUAL.

   Más adelante el servidor controlará:

   - fecha real del evento
   - duración de 8 horas
   - número de jugadores
   - vida del jefe
   - daño global
   - ranking
   - grupos A/B/C/D
   - bote TON
   - recompensas
*/

function setupSupremeBossPreview() {

  const nextEventDate =
    new Date();

  nextEventDate.setDate(
    nextEventDate.getDate() + 10
  );

  nextEventDate.setHours(
    20,
    0,
    0,
    0
  );


  setInterval(() => {

    updateEventCountdown(
      nextEventDate
    );

  }, 1000);


  updateEventCountdown(
    nextEventDate
  );

}


function updateEventCountdown(targetDate) {

  const now =
    new Date();

  const difference =
    targetDate.getTime() -
    now.getTime();


  if (difference <= 0) {

    elements.eventCountdown.textContent =
      "👹 JEFE SUPREMO ACTIVO";

    return;
  }


  const days =
    Math.floor(
      difference / 86400000
    );

  const hours =
    Math.floor(
      (difference % 86400000) / 3600000
    );

  const minutes =
    Math.floor(
      (difference % 3600000) / 60000
    );


  elements.eventCountdown.textContent =
    `${days}d ${hours}h ${minutes}m`;

}


/* =========================================================
   ESTRUCTURA FUTURA DEL JEFE SUPREMO
========================================================= */

/*
   Esta configuración representa las reglas acordadas.

   NO realiza pagos.

   Más adelante estos valores estarán
   controlados por el backend.
*/

const supremeBossRules = {

  intervalDays: 10,

  activeHours: 8,


  // Distribución de jugadores
  groups: {

    A: {
      playersPercentage: 15,
      rewardPercentage: 40
    },

    B: {
      playersPercentage: 20,
      rewardPercentage: 30
    },

    C: {
      playersPercentage: 35,
      rewardPercentage: 20
    },

    D: {
      playersPercentage: 30,
      rewardPercentage: 10
    }

  },


  // Cuando el jefe NO es derrotado
  failedEvent: {

    ownerPercentage: 20,

    additionalInvestmentPercentage: 10,

    topThreePercentage: 20,

    carryOver: true

  }

};


/* =========================================================
   CÁLCULO FUTURO DE GRUPOS
========================================================= */

function calculatePlayerGroup(
  playerIndex,
  totalPlayers
) {

  const positionPercentage =
    ((playerIndex + 1) / totalPlayers) * 100;


  if (
    positionPercentage <=
    supremeBossRules.groups.A.playersPercentage
  ) {

    return "A";

  }


  if (
    positionPercentage <=
    supremeBossRules.groups.A.playersPercentage +
    supremeBossRules.groups.B.playersPercentage
  ) {

    return "B";

  }


  if (
    positionPercentage <=
    supremeBossRules.groups.A.playersPercentage +
    supremeBossRules.groups.B.playersPercentage +
    supremeBossRules.groups.C.playersPercentage
  ) {

    return "C";

  }


  return "D";

}


/* =========================================================
   ARRANCAR JUEGO
========================================================= */

init();
