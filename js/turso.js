// ==================================================
// TURSO FETCH WRAPPER
// ==================================================
async function tursoFetch(sql, args = []) {
    if (TURSO_URL.includes("your-database")) {
        console.warn("Turso URL belum dikonfigurasi. Menggunakan mode simulasi.");
        return null;
    }

    const formattedArgs = args.map(arg => {
        if (typeof arg === 'number') return { type: 'integer', value: String(arg) };
        return { type: 'text', value: String(arg) };
    });

    try {
        const response = await fetch(`${TURSO_URL}/v2/pipeline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    { type: 'execute', stmt: { sql: sql, args: formattedArgs } },
                    { type: 'close' }
                ]
            })
        });
        const data = await response.json();
        if (data.results && data.results[0].type === 'ok') {
            return data.results[0].response.result;
        } else {
            console.error("Turso Error:", data);
            return null;
        }
    } catch (e) {
        console.error("Turso Fetch Error:", e);
        return null;
    }
}

// ==================================================
// INIT STATS (REKAM KUNJUNGAN & LOAD)
// ==================================================
async function initTursoStats() {
    await tursoFetch("UPDATE stats SET total_pengunjung = total_pengunjung + 1 WHERE id = 1");

    const res = await tursoFetch("SELECT * FROM stats WHERE id = 1");
    if (res && res.rows && res.rows.length > 0) {
        const stats = res.rows[0];
        const totalAktivasi = stats[1]?.value || 0;
        const totalSuccess = stats[2]?.value || 0;
        const totalPengunjung = stats[3]?.value || 0;

        let successRate = 0;
        if (totalAktivasi > 0) {
            successRate = ((totalSuccess / totalAktivasi) * 100).toFixed(1);
        }

        const elTotal = document.getElementById('statTotal');
        const elRate = document.getElementById('statSuccessRate');
        const elVisit = document.getElementById('statPengunjung');
        if (elTotal) elTotal.innerText = totalAktivasi;
        if (elRate) elRate.innerText = `${successRate}%`;
        if (elVisit) elVisit.innerText = totalPengunjung;
    }
}

// ==================================================
// FETCH HISTORY
// ==================================================
async function fetchTursoHistory() {
    const res = await tursoFetch("SELECT * FROM history ORDER BY id DESC LIMIT 25");
    if (res && res.rows) {
        activationLogs = res.rows.map(row => ({
            email: row[1].value,
            orderId: row[2].value,
            status: row[3].value,
            date: row[4].value
        }));
        renderHistoryLogs();
    }
}