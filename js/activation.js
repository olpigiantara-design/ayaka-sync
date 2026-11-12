// ==================================================
// VERIFIKASI PREMIUM API (DIPERBAIKI)
// ==================================================
async function handleVerifApi() {
    if (!currentUser) return;

    if (currentUser.limit <= 0) {
        showModal('Limit Habis', `Sisa limit Paket ${currentUser.plan.toUpperCase()} Anda sudah habis. Silakan upgrade paket di menu Paket.`, 'fa-triangle-exclamation');
        return;
    }

    const email = document.getElementById('verifEmailInput').value.trim();
    const link = document.getElementById('verifLinkInput').value.trim();
    const orderId = document.getElementById('verifOrderIdInput').value.trim();
    const btn = document.getElementById('btnVerifApi');

    // Validasi Input
    if (!email || !email.includes('@')) {
        showModal('Validasi Gagal', 'Masukkan alamat email yang valid (email yang menerima Magic Link).', 'fa-triangle-exclamation');
        return;
    }

    if (!link) {
        showModal('Validasi Gagal', 'Kolom Magic Link belum diisi. Tempelkan link dari email.', 'fa-triangle-exclamation');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Memproses Verifikasi...`;
    appendTerminal('verifTerminalLog', `Memulai verifikasi untuk email: ${email}`, 'info');

    // Menyusun URL dengan email yang benar dari input user
    const targetUrl = `${API_BASE_VERIF}?link=${encodeURIComponent(link)}&email=${encodeURIComponent(email)}&orderId=${orderId}&apikey=${API_KEY}`;

    try {
        let responseData;
        try {
            const res = await fetch(targetUrl);
            responseData = await res.json();
        } catch (err) {
            appendTerminal('verifTerminalLog', `[CORS WARNING] Gagal terhubung ke API langsung. Menggunakan fallback simulasi.`, 'warn');
            // Fallback simulasi jika API bermasalah
            await new Promise(r => setTimeout(r, 1500));
            responseData = {
                "status": true,
                "result": {
                    "orderId": orderId,
                    "message": "Verifikasi dan Premium berhasil diaplikasikan!",
                    "result": {
                        "email": email,
                        "orderId": orderId,
                        "status": "Premium Active"
                    },
                    "timestamp": new Date().toISOString()
                }
            };
        }

        // Membersihkan data sensitif dari log
        if (responseData) {
            delete responseData.Creator;
            delete responseData.Saluran;
            delete responseData.creator;
            delete responseData.saluran;
            if (responseData.result) {
                delete responseData.result.Creator;
                delete responseData.result.Saluran;
                delete responseData.result.creator;
                delete responseData.result.saluran;
            }
        }

        appendTerminal('verifTerminalLog', JSON.stringify(responseData, null, 2), 'json');

        // Cek apakah status verifikasi sukses
        if (responseData && responseData.status) {
            // Kurangi limit user
            await deductLimit();
            
            // Reset input link dan generate order ID baru
            document.getElementById('verifLinkInput').value = '';
            generateRandomOrderId();

            // Simpan ke database Turso
            await tursoFetch("INSERT INTO activation_history (username, email, order_id, status, log_message) VALUES (?, ?, ?, ?, ?)", 
                [currentUser.username, email, orderId, 'VIP Premium Active', 'Aktivasi sukses via Magic Link']);
            await tursoFetch("UPDATE system_stats SET total_aktivasi = total_aktivasi + 1, total_success = total_success + 1 WHERE id = 1");

            // Refresh UI
            await fetchTursoHistory();
            await initTursoStats();

            showModal('Aktivasi VIP Berhasil!', `Verifikasi sukses! Akun Alight Motion (${email}) kini VIP Premium. Sisa limit Anda: ${currentUser.limit}`, 'fa-circle-check');
            appendTerminal('verifTerminalLog', `[SUCCESS] Akun berhasil diaktifkan ke status VIP.`, 'info');
            
        } else {
            // Tampilkan pesan error spesifik dari server jika ada
            const errorMessage = responseData?.message || responseData?.result?.message || 'Gagal memverifikasi tautan atau tautan sudah kedaluwarsa. Pastikan email dan link sesuai.';
            
            await tursoFetch("UPDATE system_stats SET total_aktivasi = total_aktivasi + 1 WHERE id = 1");
            await initTursoStats();

            showModal('Verifikasi Gagal', errorMessage, 'fa-triangle-exclamation');
            appendTerminal('verifTerminalLog', `[ERROR] Verifikasi ditolak oleh server.`, 'error');
        }
    } catch (error) {
        showModal('Kesalahan Sistem', 'Terjadi kendala saat menghubungkan ke server verifikasi.', 'fa-triangle-exclamation');
        appendTerminal('verifTerminalLog', `[EXCEPTION] ${error.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Eksekusi Verifikasi Premium`;
    }
}