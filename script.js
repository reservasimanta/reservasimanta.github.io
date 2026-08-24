const scriptURL = 'https://script.google.com/macros/s/AKfycbx4QmqekrgB13KF41hQzT16pwhXZMGlJuDfB2KC_oG5m6jMcPnL425Co8ufsvN_Mt9h0A/exec';

let selectedKategori = "";
let selectedSite = "";
let selectedActivity = ""; 
let namaOperatorTerlogin = "";

document.addEventListener('DOMContentLoaded', function () {
    setBatasTanggalBooking();

    const visitDateInput = document.getElementById('visitDate');
    const visitTimeInput = document.getElementById('visitTime');

    // Event listener untuk memicu pembaruan badge kuota saat tanggal atau waktu diubah
    if (visitDateInput && visitTimeInput) {
        visitDateInput.addEventListener('change', perbaruiSemuaBadgeKuota);
        visitTimeInput.addEventListener('change', perbaruiSemuaBadgeKuota);
    }
});

function pindahKe(target) {
    if (target === 'signup') {
        document.getElementById('box-login').classList.add('hidden');
        document.getElementById('box-signup').classList.remove('hidden');
    } else {
        document.getElementById('box-signup').classList.add('hidden');
        document.getElementById('box-login').classList.remove('hidden');
    }
}

// --- PROCESS SIGN UP ---
function prosesSignUp() {
    const nama = document.getElementById('regOperator').value;
    const kontakWA = document.getElementById('regWA').value; 
    const password = document.getElementById('regPassword').value;
    const kategori = document.getElementById('regKategori').value;
    const btn = document.getElementById('btn-signup');

    if(!nama || !kontakWA || !password || !kategori) {
        alert("⚠️ Harap lengkapi semua data pendaftaran!");
        return;
    }

    btn.innerText = "Mendaftarkan...";
    btn.disabled = true;

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({
            action: "signup",
            nama: nama,
            email: kontakWA, 
            password: password,
            kategori: kategori
        })
    })
    .then(res => res.json())
    .then(response => {
        if(response.result === "success") {
            alert("🎉 Pendaftaran Berhasil! Data Anda telah masuk ke Admin.\nMohon tunggu proses verifikasi status akun Anda.");
            pindahKe('login');
        } else if(response.result === "exists") {
            alert("⚠️ Nomor WhatsApp ini sudah terdaftar sebelumnya!");
        } else {
            alert("❌ Gagal mendaftar: " + response.message);
        }
    })
    .catch(error => alert("Error koneksi: " + error.message))
    .finally(() => {
        btn.innerText = "DAFTAR SEKARANG";
        btn.disabled = false;
    });
}

// --- PROCESS LOGIN ---
function prosesLogin() {
    const user = document.getElementById('loginUsername').value;
    const pass = document.getElementById('loginPassword').value;
    const btn = document.getElementById('btn-login');

    if (!user || !pass) {
        alert("⚠️ Masukkan Kontak WA dan kata sandi!");
        return;
    }

    btn.innerText = "Memverifikasi...";
    btn.disabled = true;

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({
            action: "login",
            username: user,
            password: pass
        })
    })
    .then(res => res.json())
    .then(response => {
        if (response.result === "success") {
            if (response.status === "APPROVED") {
                namaOperatorTerlogin = response.nama;
                if (response.role === "Petugas") {
                    document.getElementById('page-auth').classList.add('hidden');
                    document.getElementById('page-landing').classList.add('hidden');
                    document.getElementById('page-petugas').classList.remove('hidden');

                    if (document.getElementById('nama-petugas-aktif')) {
                        document.getElementById('nama-petugas-aktif').innerText = namaOperatorTerlogin;
                    }
                    muatManifesPetugas();
                } else {
                    const elNamaOperator = document.getElementById('nama-operator-aktif');
                    if (elNamaOperator) elNamaOperator.innerText = namaOperatorTerlogin;
                    const elInputOperator = document.getElementById('operatorName');
                    if (elInputOperator) elInputOperator.value = namaOperatorTerlogin;

                    document.getElementById('page-auth').classList.add('hidden');
                    document.getElementById('page-petugas').classList.add('hidden');
                    document.getElementById('page-landing').classList.remove('hidden');

                    muatRiwayatPrivat();
                }
            } else {
                alert("🔒 Akun Anda ditemukan, namun BELUM DIVERIFIKASI oleh Admin. Silakan hubungi dinas terkait.");
            }
        } else {
            alert("❌ Nomor WA atau Kata Sandi salah!");
        }
    })
    .catch(error => alert("Error saat verifikasi login: " + error.message))
    .finally(() => {
        btn.innerText = "MASUK SYSTEM";
        btn.disabled = false;
    });
}

function kirimLaporanPelanggaran() {
    if (!namaOperatorTerlogin) {
        alert("Sesi login berakhir. Silakan login kembali.");
        return;
    }

    const dataPelanggaran = {
        action: "laporkanPelanggaran",
        pelanggar: document.getElementById('pelanggarNama').value,
        jenis: document.getElementById('pelanggarJenis').value,
        catatan: document.getElementById('pelanggarCatatan').value,
        bukti: document.getElementById('pelanggarBukti').value,
        pelapor: namaOperatorTerlogin
    };

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(dataPelanggaran)
    })
    .then(res => res.json())
    .then(response => {
        if(response.result === "success") {
            alert("🚨 Laporan pelanggaran kode etik telah disimpan di database BLUD!");
            document.getElementById('formPelanggaran').reset();
        }
    });
}

// --- NAVIGATION MENU ---
function bukaFitur(fitur) {
    document.getElementById('page-landing').classList.add('hidden');
    if (fitur === 'booking') {
        document.getElementById('page-booking').classList.remove('hidden');
        muatRiwayatPrivat(); 
    } else if (fitur === 'sop') {
        document.getElementById('page-sop').classList.remove('hidden');
    }
}

function kembaliKeMenu(fitur) {
    if (fitur === 'booking') {
        document.getElementById('page-booking').classList.add('hidden');
        document.getElementById('page-landing').classList.remove('hidden');
    } else if (fitur === 'sop') {
        document.getElementById('page-sop').classList.add('hidden');
        document.getElementById('page-landing').classList.remove('hidden');
    } else if (fitur === 'petugas') {
        document.getElementById('page-petugas').classList.add('hidden');
        document.getElementById('page-auth').classList.remove('hidden');
    }
}

function logout() {
    if(confirm("Apakah Anda ingin keluar?")) {
        document.getElementById('page-landing').classList.add('hidden');
        document.getElementById('page-petugas').classList.add('hidden');
        
        document.getElementById('page-auth').classList.remove('hidden');
        document.getElementById('loginUsername').value = "";
        document.getElementById('loginPassword').value = "";
        namaOperatorTerlogin = "";

        const tbody = document.getElementById('isi-riwayat');
        if(tbody) tbody.innerHTML = "";
    }
}

// --- RESERVATION SYSTEM ENGINE ---
function selectKategori(kat) {
    selectedKategori = kat;
    document.getElementById('section-kategori').classList.add('hidden');
    document.getElementById('section-booking').classList.remove('hidden');
    document.getElementById('display-kategori').innerText = "Booking Form: " + kat;
}

function selectSite(site) {
    selectedSite = site;
    document.querySelectorAll('.site-card').forEach(c => c.classList.remove('selected-site'));
    
    document.getElementById('buttons-ridge').style.display = 'none';
    document.getElementById('buttons-mambarayub').style.display = 'none';
    
    document.getElementById('booking-form').classList.add('hidden');
    document.getElementById('wrapper-guide').style.display = 'none';
    document.getElementById('tamu-diving').value = "";
    if(document.getElementById('tamu-guide')) document.getElementById('tamu-guide').value = "";
    document.getElementById('container-tamu').innerHTML = ""; 

    // baris visitTime.value = "" SUDAH DIHAPUS

    if (site === 'Manta Sandy') {
        document.getElementById('site-sandy').classList.add('selected-site');
        document.getElementById('booking-form').classList.remove('hidden');
        document.getElementById('selected-site-title').innerText = "Detail Kunjungan: Manta Sandy (DIVING)";
        
        selectedActivity = "diving"; 
        document.getElementById('wrapper-guide').style.display = 'block'; 
        document.getElementById('tamu-diving').placeholder = "Jumlah Tamu";
    } 
    else if (site === 'Manta Ridge') {
        document.getElementById('site-ridge').classList.add('selected-site');
        document.getElementById('buttons-ridge').style.display = 'flex'; 
    } 
    else if (site === 'Mambarayub') {
        document.getElementById('site-Mambarayub').classList.add('selected-site');
        document.getElementById('buttons-mambarayub').style.display = 'flex'; 
    }
}

function selectActivity(activity, event) {
    event.stopPropagation(); 
    selectedActivity = activity;

    document.getElementById('booking-form').classList.remove('hidden');
    document.getElementById('selected-site-title').innerText = `Detail Kunjungan: ${selectedSite} (${activity.toUpperCase()})`;

    const inputTamu = document.getElementById('tamu-diving');
    const inputGuide = document.getElementById('tamu-guide');
    
    inputTamu.value = "";
    if(inputGuide) inputGuide.value = "";
    document.getElementById('container-tamu').innerHTML = "";

    document.getElementById('wrapper-guide').style.display = 'block'; 
    inputTamu.placeholder = "Jumlah Tamu";
    if(inputGuide) inputGuide.placeholder = "Jumlah Guide";
}

function validateKapasitas() {
    const inputTamu = document.getElementById('tamu-diving');
    const inputGuide = document.getElementById('tamu-guide');
    
    let jumlahTamu = parseInt(inputTamu.value) || 0;
    let jumlahGuide = inputGuide ? (parseInt(inputGuide.value) || 0) : 0;
    let totalOrang = jumlahTamu + jumlahGuide;

    let maxKapasitas = 0;
    if (selectedSite === 'Manta Sandy') {
        maxKapasitas = 20; 
    } else if (selectedSite === 'Manta Ridge' || selectedSite === 'Mambarayub') {
        maxKapasitas = (selectedActivity === 'snorkeling') ? 8 : 10;
    }

    if (totalOrang > maxKapasitas) {
        alert(`Batas maksimal total (Tamu + Guide) untuk ${selectedActivity.toUpperCase()} di ${selectedSite} adalah ${maxKapasitas} orang.\nTotal input saat ini: ${totalOrang} orang.`);
        
        jumlahTamu = maxKapasitas - jumlahGuide;
        if (jumlahTamu < 0) {
            jumlahTamu = 0;
            if(inputGuide) inputGuide.value = maxKapasitas;
        }
        inputTamu.value = jumlahTamu;
    }
    
    return jumlahTamu;
}

let requestTamuTerakhir = 0;

// --- FUNGSI CEK KUOTA REAL-TIME BERDASARKAN JAM OPERASIONAL ---
function cekKuotaRealTime(inputDate, inputTime) {
    const container = document.getElementById('container-tamu');
    const elErrorKuota = document.getElementById('pesan-error-booking');

    if (elErrorKuota) elErrorKuota.classList.add('hidden');

    if (!inputTime) {
        alert("⚠️ Silakan tentukan Pilihan Sesi Waktu Kunjungan terlebih dahulu sebelum menginput jumlah personil!");
        document.getElementById('tamu-diving').value = "";
        if(document.getElementById('tamu-guide')) document.getElementById('tamu-guide').value = "";
        return;
    }

    if (!inputDate) {
        alert("⚠️ Silakan pilih tanggal kunjungan terlebih dahulu!");
        return;
    }

    var jumlah = validateKapasitas();
    container.innerHTML = "";

    if (jumlah <= 0) {
        container.classList.add('hidden');
        return;
    }

    requestTamuTerakhir++;
    const requestIniNomor = requestTamuTerakhir;

    const inputTamu = document.getElementById('tamu-diving');
    const inputGuide = document.getElementById('tamu-guide');
    const totalDiminta = (parseInt(inputTamu.value) || 0) + (inputGuide ? (parseInt(inputGuide.value) || 0) : 0);

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify({
            action: "cekKuota",
            site: selectedSite,
            date: inputDate,
            time: inputTime,
            activity: typeof selectedActivity !== 'undefined' ? selectedActivity : "diving"
        })
    })
    .then(res => res.json())
    .then(response => {
        if (requestIniNomor !== requestTamuTerakhir) return;

        if (response.result === "success") {
            container.innerHTML = "";

            if (totalDiminta > response.sisaKuota) {
                if (elErrorKuota) {
                    elErrorKuota.innerText = `⚠️ Kuota ${selectedSite} pada jam ${inputTime} sudah hampir/penuh. Sisa slot tersedia hanya untuk ${response.sisaKuota} orang (termasuk Guide). Mohon pilih jam sesi lain atau kurangi jumlah personil.`;
                    elErrorKuota.classList.remove('hidden');
                    elErrorKuota.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                container.classList.add('hidden');
                return;
            }

            for (var i = 0; i < jumlah; i++) {
                container.innerHTML += `
                    <div class="tamu-row" style="border: 1px solid #ddd; margin-bottom: 15px; padding: 12px; border-radius: 8px; background:#f9f9f9; text-align: left;">
                        <strong style="display:block; margin-bottom: 8px;">Wisatawan ${i+1} (${selectedActivity.toUpperCase()}):</strong>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <input type="text" class="nama-tamu" placeholder="Nama Lengkap Sesuai Paspor/KTP" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 100%; box-sizing: border-box;">
                            <div style="display: flex; gap: 8px;">
                                <input type="text" class="negara-tamu" placeholder="Asal Negara" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; flex: 2;">
                                <select class="gender-tamu" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; flex: 1;">
                                    <option value="L">Laki-laki (L)</option>
                                    <option value="P">Perempuan (P)</option>
                                </select>
                            </div>
                        </div>
                    </div>`;
            }
            container.classList.remove('hidden');
        }
    })
    .catch(err => {
        console.error("Gagal cek kuota:", err);
    });
}

// Penghubung fungsi input ke form HTML (menggantikan generateInputTamu)
function generateInputTamu() {
    const inputTime = document.getElementById('visitTime').value;
    const inputDate = document.getElementById('visitDate').value;
    cekKuotaRealTime(inputDate, inputTime);
    perbaruiSemuaBadgeKuota(); // Opsional: ikut memicu update badge saat input berubah
}

// --- FUNGSI CEK STATUS KUOTA SEMUA SITE (UNTUK UPDATE BADGE) ---
function perbaruiSemuaBadgeKuota() {
    const visitDate = document.getElementById('visitDate').value;
    const visitTime = document.getElementById('visitTime').value;

    if (!visitDate || !visitTime) {
        resetBadgeKeDefault();
        return;
    }

    const sites = [
        { name: 'Manta Sandy', elementId: 'badge-sandy', activity: 'diving', label: 'Diving' },
        { name: 'Manta Ridge', elementId: 'badge-ridge-snork', activity: 'snorkeling', label: 'Snorkeling' },
        { name: 'Manta Ridge', elementId: 'badge-ridge-div', activity: 'diving', label: 'Diving' },
        { name: 'Mambarayub', elementId: 'badge-mambarayub-snork', activity: 'snorkeling', label: 'Snorkeling' },
        { name: 'Mambarayub', elementId: 'badge-mambarayub-div', activity: 'diving', label: 'Diving' }
    ];

    sites.forEach(siteObj => {
        const badge = document.getElementById(siteObj.elementId);
        if (!badge) return;

        badge.className = "status-badge bg-abu";
        badge.innerText = `${siteObj.label}: Memeriksa...`;

        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify({
                action: "cekKuota",
                site: siteObj.name,
                date: visitDate,
                time: visitTime,
                activity: siteObj.activity
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.result === "success") {
                let sisa = response.sisaKuota;
                if (sisa <= 0) {
                    badge.className = "status-badge bg-merah";
                    badge.innerText = `${siteObj.label} Penuh`;
                } else {
                    badge.className = "status-badge bg-hijau";
                    badge.innerText = `${siteObj.label} Tersedia (${sisa} slot)`;
                }
            } else {
                badge.className = "status-badge bg-abu";
                badge.innerText = `${siteObj.label}: Gagal memuat`;
            }
        })
        .catch(err => {
            console.error(`Gagal memuat kuota untuk ${siteObj.name}:`, err);
            badge.className = "status-badge bg-abu";
            badge.innerText = `${siteObj.label}: Error koneksi`;
        });
    });
}      

function resetBadgeKeDefault() {
    const badgeIds = ['badge-sandy', 'badge-ridge-snork', 'badge-ridge-div', 'badge-mambarayub-snork', 'badge-mambarayub-div'];
    badgeIds.forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
            badge.className = "status-badge bg-abu";
            badge.innerText = "Pilih Tanggal & Jam";
        }
    });
}
         
function cekValidasiTanggalSOP() {
    const inputDateVal = document.getElementById('visitDate').value;
    if (!inputDateVal) {
        alert("⚠️ Silakan pilih tanggal kunjungan terlebih dahulu!");
        return false;
    }

    const parts = inputDateVal.split('-');
    const tanggalKunjungan = new Date(parts[0], parts[1] - 1, parts[2]);
    tanggalKunjungan.setHours(0, 0, 0, 0);

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const selisihWaktu = tanggalKunjungan.getTime() - hariIni.getTime();
    const selisihHari = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24));

    if (selisihHari < 0) {
        alert("❌ Tidak dapat memilih tanggal kunjungan yang sudah berlalu!");
        return false;
    }

    if (selisihHari < 3) {
        alert(`❌ Sistem Menolak Booking!\nSesuai SOP Pengelola, pendaftaran jadwal paling lambat dilakukan H-3 sebelum kunjungan.\n\nBooking H-2, H-1, atau Hari-H dilarang.`);
        return false;
    }

    if (selisihHari > 30) {
        alert("❌ Pendaftaran slot pre-reservasi maksimal dapat dilakukan 30 hari sebelum tanggal kunjungan!");
        return false;
    }

    return selisihHari; 
}
     
function submitBooking() {
    const elErrorAwal = document.getElementById('pesan-error-booking');
    if (elErrorAwal) elErrorAwal.classList.add('hidden');
    const date = document.getElementById('visitDate').value;
    const time = document.getElementById('visitTime').value; 
    
    const elTamu = document.getElementById('tamu-diving');
    const elGuide = document.getElementById('tamu-guide'); 
    
    const paxTamu = elTamu ? (parseInt(elTamu.value) || 0) : 0;
    const paxGuide = elGuide ? (parseInt(elGuide.value) || 0) : 0; 
    
    const btn = document.getElementById('btn-submit');

    if(!date || !time || !paxTamu || !selectedSite) {
        alert("⚠️ Mohon isi seluruh kelengkapan formulir booking jadwal!");
        return;
    }

    const selisihHari = cekValidasiTanggalSOP();
    if (selisihHari === false) return; 

    let statusBookingOtomatis = "PRE-BOOKED"; 
    if (selisihHari === 3) {
        statusBookingOtomatis = "CONFIRMED"; 
    }

    const totalKapasitasSesi = paxTamu + paxGuide;

    let maxKapasitas = 0;
    if (selectedSite === 'Manta Sandy') {
        maxKapasitas = 20;
    } else if (selectedSite === 'Manta Ridge' || selectedSite === 'Mambarayub') {
        maxKapasitas = (typeof selectedActivity !== 'undefined' && selectedActivity === 'snorkeling') ? 8 : 10;
    }

    if (totalKapasitasSesi > maxKapasitas) {
        alert(`❌ Batas Maksimal Gagal!\nKapasitas ${selectedSite} untuk aktivitas ${selectedActivity.toUpperCase()} maksimal ${maxKapasitas} orang.\nTotal input Anda: ${totalKapasitasSesi} orang.`);
        return;
    }

    var arrayDaftarTamu = [];
    var rows = document.querySelectorAll('.tamu-row');
    
    for(var i=0; i<rows.length; i++) {
        var namaInput = rows[i].querySelector('.nama-tamu');
        var negaraInput = rows[i].querySelector('.negara-tamu');
        var genderInput = rows[i].querySelector('.gender-tamu');
        
        if(namaInput && negaraInput) {
            var nama = namaInput.value.trim();
            var negara = negaraInput.value.trim();
            var gender = genderInput ? genderInput.value : "L";
            
            if(!nama || !negara) {
                alert(`⚠️ Mohon lengkapi identitas Wisatawan ke-${i+1}!`);
                return;
            }
            arrayDaftarTamu.push({nama: nama, negara: negara, gender: gender});
        }
    }

    btn.innerText = "Mengirim Pesanan Jadwal...";
    btn.disabled = true;

    let jumlahDiving = 0;
    let jumlahSnorkeling = 0;

    if (selectedActivity === 'snorkeling') {
        jumlahSnorkeling = paxTamu;
    } else {
        jumlahDiving = paxTamu;
    }

    var bookingId = "BK" + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

   var dataKeSheets = {
        action: "booking",
        booking_id: bookingId,
        date: date,
        operator: namaOperatorTerlogin,
        category: selectedKategori,
        site: selectedSite,
        activity: typeof selectedActivity !== 'undefined' ? selectedActivity : "diving", 
        time: time,
        diving_tamu: jumlahDiving,        
        snorkeling_tamu: jumlahSnorkeling, 
        diving_guide: paxGuide,        
        total_pax: totalKapasitasSesi, 
        status_booking: statusBookingOtomatis, 
        tamu_detail: JSON.stringify(arrayDaftarTamu)
    };

    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(dataKeSheets)
    })
    .then(res => res.json()) 
    .then(response => {
        if(response.result === "success") {
            if(document.getElementById('rec-site')) document.getElementById('rec-site').innerText = selectedSite + " (" + selectedActivity.toUpperCase() + ")";
            if(document.getElementById('rec-operator')) document.getElementById('rec-operator').innerText = namaOperatorTerlogin;
            if(document.getElementById('rec-date')) document.getElementById('rec-date').innerText = date;
            if(document.getElementById('rec-time')) document.getElementById('rec-time').innerText = time + " WIT";
            if(document.getElementById('rec-category')) document.getElementById('rec-category').innerText = selectedKategori;
            if(document.getElementById('rec-pax')) document.getElementById('rec-pax').innerText = totalKapasitasSesi + " Orang (Tamu: " + paxTamu + ", Guide: " + paxGuide + ")";
            if(document.getElementById('rec-status')) document.getElementById('rec-status').innerText = statusBookingOtomatis;

            alert(`🎉 Berhasil!\nJadwal masuk ke sistem dengan Status otomatis: [${statusBookingOtomatis}].`);

            const popup = document.getElementById('popup-receipt');
            if(popup) popup.classList.remove('hidden');

            if(document.getElementById('visitDate')) document.getElementById('visitDate').value = "";
            if(document.getElementById('visitTime')) document.getElementById('visitTime').value = "";
            if(elTamu) elTamu.value = "";
            if(elGuide) elGuide.value = ""; 
            
            document.getElementById('container-tamu').innerHTML = "";
            document.getElementById('booking-form').classList.add('hidden');
            document.querySelectorAll('.site-card').forEach(c => c.classList.remove('selected-site'));
            
            muatRiwayatPrivat();
        } else if(response.result === "quota_exceeded") {
            const elError = document.getElementById('pesan-error-booking');
            if (elError) {
                elError.innerText = "⚠️ " + response.message;
                elError.classList.remove('hidden');
                elError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                alert("⚠️ Gagal Booking: " + response.message);
            }
        } else {
            alert("❌ Gagal menyimpan jadwal booking: " + response.message);
        }
    })
    .catch(error => {
        alert("❌ Terjadi kesalahan jaringan atau Apps Script: " + error.message);
    })
    .finally(() => {
        btn.innerText = "Booking Now";
        btn.disabled = false;
    });
}
         
// --- POP-UP CLOSING MANAGEMENT ---
function tutupStrukBooking() {
    const popup = document.getElementById('popup-receipt');
    if(popup) popup.classList.add('hidden');
    kembaliKeMenu('booking');
}

// --- MEMUAT DATA RIWAYAT PRIVAT ---
function muatRiwayatPrivat() {
    if (!namaOperatorTerlogin) return;

    fetch(scriptURL + "?action=readPublic")
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('isi-riwayat');
        const loading = document.getElementById('loading-riwayat');
        const tabel = document.getElementById('tabel-riwayat');
        
        if (!tbody) return; 
        tbody.innerHTML = ""; 

        if (data && data.length > 0) {
            const riwayatSaya = data.filter(item => {
                return item.operator.toLowerCase().trim() === namaOperatorTerlogin.toLowerCase().trim();
            });

            if (riwayatSaya.length > 0) {
                riwayatSaya.forEach((item) => {
                    const dataString = encodeURIComponent(JSON.stringify(item));
                    let warnaStatus = item.status === "CONFIRMED" ? "#22c55e" : "#f39c12";

                    let row = `<tr>
                        <td><strong>${item.tanggal}</strong></td>
                        <td>${item.site || "-"}</td>
                        <td>${item.jumlah} Orang</td>
                        <td><span style="color: ${warnaStatus}; font-weight: bold;">● ${item.status}</span></td>
                        <td>
                            <button onclick="panggilUlangStruk('${dataString}')" style="background: #003049; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; width: auto; margin: 0;">
                                📂 Lihat Tiket
                            </button>
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                });
                if(loading) loading.style.display = "none";
                if(tabel) tabel.style.display = "table";
            } else {
                if(loading) {
                    loading.style.display = "block";
                    loading.innerText = "Tidak ada bukti booking aktif milik Anda.";
                }
                if(tabel) tabel.style.display = "none";
            }
        } else {
            if(loading) {
                loading.style.display = "block";
                loading.innerText = "Belum ada jadwal konfirmasi di database.";
            }
            if(tabel) tabel.style.display = "none";
        }
    })
    .catch(err => {
        console.error("Gagal memuat data riwayat privat:", err);
    });
}

// --- MEMUAT DATA LOGBOOK/MANIFES KESELURUHAN (KHUSUS PETUGAS) ---
function muatManifesPetugas() {
    fetch(scriptURL + "?action=readAll") 
    .then(response => response.json())
    .then(data => {
        const tbody = document.getElementById('isi-manifes-petugas'); 
        const loading = document.getElementById('loading-petugas');
        const tabel = document.getElementById('tabel-petugas');
        
        if (!tbody) return; 
        tbody.innerHTML = ""; 

        if (data && data.length > 0) {
            data.forEach((item) => {
                let warnaStatus = item.status === "CONFIRMED" ? "#22c55e" : "#f39c12";

                let row = `<tr>
                    <td><strong>${item.tanggal}</strong></td>
                    <td>${item.operator} <span style="font-size:10px; color:#666;">(${item.kategori})</span></td>
                    <td>${item.site || "-"}</td>
                    <td>${item.jam} WIT</td>
                    <td>${item.jumlah} Orang</td>
                    <td><span style="color: ${warnaStatus}; font-weight: bold;">● ${item.status}</span></td>
                </tr>`;
                tbody.innerHTML += row;
            });

            if(loading) loading.style.display = "none";
            if(tabel) tabel.style.display = "table";
        } else {
            if(loading) {
                loading.style.display = "block";
                loading.innerText = "Hari ini belum ada manifes kunjungan terdaftar.";
            }
            if(tabel) tabel.style.display = "none";
        }
    })
    .catch(err => {
        console.error("Gagal memuat logbook petugas:", err);
        if(loading) loading.innerText = "Gagal mengambil data dari server.";
    });
}

// --- MEMANGGIL KEMBALI KARTU BUKTI DARI DATABASE JADWAL ---
function panggilUlangStruk(dataString) {
    const item = JSON.parse(decodeURIComponent(dataString));
    
    const labelAktivitas = item.aktivitas === 'snorkeling' ? 'SNORKELING' : 'DIVING';
    document.getElementById('rec-site').innerText = (item.site || "-") + " (" + labelAktivitas + ")";
    document.getElementById('rec-operator').innerText = item.operator;
    document.getElementById('rec-date').innerText = item.tanggal;
    document.getElementById('rec-time').innerText = (item.jam || "00:00") + " WIT";
    document.getElementById('rec-category').innerText = item.kategori || "-";
    document.getElementById('rec-pax').innerText = (item.jumlah || 0) + " Orang (Tamu: " + (item.tamu || 0) + ", Guide: " + (item.guide || 0) + ")";
    if(document.getElementById('rec-status')) document.getElementById('rec-status').innerText = item.status;

    const popup = document.getElementById('popup-receipt');
    if(popup) popup.classList.remove('hidden');
}

function setBatasTanggalBooking() {
    const inputTanggal = document.getElementById('visitDate');
    if (!inputTanggal) return;

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    // Minimal H+3 sesuai SOP
    const tanggalMin = new Date(hariIni);
    tanggalMin.setDate(hariIni.getDate() + 3);

    // Maksimal H+30
    const tanggalMax = new Date(hariIni);
    tanggalMax.setDate(hariIni.getDate() + 30);

    const formatDate = (d) => {
        let tahun = d.getFullYear();
        let bulan = String(d.getMonth() + 1).padStart(2, '0');
        let hari = String(d.getDate()).padStart(2, '0');
        return `${tahun}-${bulan}-${hari}`;
    };

    inputTanggal.min = formatDate(tanggalMin);
    inputTanggal.max = formatDate(tanggalMax);
}