// ==================================================
// GLOBAL APP STATE
// ==================================================
let sessionStartTime = Date.now();
let currentUser = null;       // Tidak pakai localStorage
let activationLogs = [];      // Di-fetch dari Turso
let pendingPlan = null;
let pendingLimit = 0;