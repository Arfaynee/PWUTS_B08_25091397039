(() => {
  'use strict';
  const pages = { beranda: 'pages/beranda.html', kamar: 'pages/kamar.html', 'tambah-kamar': 'pages/tambah-kamar.html' };
  const pageLabels = { beranda: 'Dashboard', kamar: 'Daftar Kamar', 'tambah-kamar': 'Tambah Kamar' };
  const roomStatuses = { tersedia: 'Tersedia', terisi: 'Terisi', perbaikan: 'Perbaikan' };
  const app = document.querySelector('#app');
  const STORAGE_KEY = 'kosKitaFarhan.kamar.v1';
  const seedKos = [{"id_kos":1,"nama_kos":"Kos Mawar","alamat":"Jl. Mawar No. 12, Surabaya"},{"id_kos":2,"nama_kos":"Kos Melati","alamat":"Jl. Melati No. 8, Surabaya"},{"id_kos":3,"nama_kos":"Kos Anggrek","alamat":"Jl. Anggrek No. 20, Surabaya"},{"id_kos":4,"nama_kos":"Kos Kenanga","alamat":"Jl. Kenanga No. 5, Surabaya"}];
  const seedRooms = [{"id_kamar":101,"id_kos":1,"nomor_kamar":"A-101","harga":750000,"status":"tersedia"},{"id_kamar":102,"id_kos":1,"nomor_kamar":"A-102","harga":800000,"status":"terisi"},{"id_kamar":103,"id_kos":1,"nomor_kamar":"A-103","harga":850000,"status":"tersedia"},{"id_kamar":104,"id_kos":1,"nomor_kamar":"A-104","harga":700000,"status":"perbaikan"},{"id_kamar":105,"id_kos":1,"nomor_kamar":"B-201","harga":900000,"status":"terisi"},{"id_kamar":106,"id_kos":1,"nomor_kamar":"B-202","harga":950000,"status":"tersedia"},{"id_kamar":201,"id_kos":2,"nomor_kamar":"M-101","harga":680000,"status":"tersedia"},{"id_kamar":202,"id_kos":2,"nomor_kamar":"M-102","harga":720000,"status":"terisi"},{"id_kamar":203,"id_kos":2,"nomor_kamar":"M-103","harga":740000,"status":"tersedia"},{"id_kamar":204,"id_kos":2,"nomor_kamar":"M-104","harga":700000,"status":"perbaikan"},{"id_kamar":301,"id_kos":3,"nomor_kamar":"G-01","harga":850000,"status":"tersedia"},{"id_kamar":302,"id_kos":3,"nomor_kamar":"G-02","harga":900000,"status":"terisi"},{"id_kamar":303,"id_kos":3,"nomor_kamar":"G-03","harga":920000,"status":"tersedia"},{"id_kamar":401,"id_kos":4,"nomor_kamar":"K-01","harga":650000,"status":"tersedia"},{"id_kamar":402,"id_kos":4,"nomor_kamar":"K-02","harga":675000,"status":"terisi"}];
  let rooms = [];
  let kosList = [];
  // Ingat kos yang sedang dibuka; parameter ?kos= menjaga pilihan tetap ada saat refresh.
  let selectedKosId = Number(new URLSearchParams(location.search).get('kos')) || null;
  let selectedKosAfterSave = null;
  let activePage = '';
  let toastTimeout;

  const formatRupiah = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  const safeText = input => String(input).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function showToast(message) {
    const toast = document.querySelector('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 3500);
  }

  // Data awal dibuat sekali per browser. Semua tambah dan ubah status disimpan lokal.
  function persistRooms(nextRooms) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRooms));
    } catch (_) {
      throw new Error('Penyimpanan browser gagal. Periksa apakah penyimpanan situs diizinkan atau ruang browser penuh.');
    }
    // Pastikan data bisa dibaca kembali sebelum menyatakan berhasil.
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(saved) || saved.length !== nextRooms.length) throw new Error();
    } catch (_) {
      throw new Error('Data belum dapat diverifikasi di penyimpanan browser.');
    }
  }

  async function getRooms() {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      throw new Error('Browser tidak mengizinkan localStorage. Periksa pengaturan penyimpanan situs.');
    }
    if (raw === null) {
      persistRooms(seedRooms);
      raw = localStorage.getItem(STORAGE_KEY);
    }
    try {
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved) || !saved.every(r => Number.isInteger(Number(r.id_kamar)) && Number.isInteger(Number(r.id_kos)) && typeof r.nomor_kamar === 'string' && Number.isFinite(Number(r.harga)) && Object.hasOwn(roomStatuses, r.status))) throw new Error();
      rooms = saved;
      return rooms;
    } catch (_) {
      throw new Error('Data kamar di penyimpanan browser tidak valid. Periksa data localStorage sebelum menghapusnya.');
    }
  }

  async function getKos() {
    kosList = seedKos;
    return kosList;
  }

  function populateKosSelect(select) {
    if (!select) return;
    select.innerHTML = `<option value="">— Pilih nama kos dahulu —</option>` + kosList.map(kos =>
      `<option value="${Number(kos.id_kos)}">${safeText(kos.nama_kos)}</option>`
    ).join('');
  }

  function nameOfKos(id) {
    return kosList.find(kos => Number(kos.id_kos) === Number(id))?.nama_kos || 'Kos tidak dikenal';
  }

  function setActiveNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const selected = link.dataset.page === page;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelector('#current-label').textContent = pageLabels[page];
    document.title = `${pageLabels[page]} | KosKita`;
    const sidebar = document.querySelector('#sidebar');
    sidebar.classList.remove('is-open');
    document.querySelector('#menu-toggle').setAttribute('aria-expanded', 'false');
  }

  async function changePage(page, updateHistory = true) {
    if (!pages[page]) page = 'beranda';
    activePage = page;
    setActiveNav(page);
    app.innerHTML = '<div class="loading">Memuat halaman…</div>';
    try {
      // AJAX: hanya konten HTML yang diambil, index.html tidak dimuat ulang.
      const response = await fetch(pages[page], { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const fragment = await response.text();
      if (activePage !== page) return;
      app.innerHTML = fragment;
      if (updateHistory) {
        const kosParam = page === 'kamar' && selectedKosId ? `&kos=${encodeURIComponent(selectedKosId)}` : '';
        history.pushState({ page }, '', `?page=${encodeURIComponent(page)}${kosParam}`);
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
      if (page === 'beranda') await initDashboard();
      if (page === 'kamar') await initRoomList();
      if (page === 'tambah-kamar') await initRoomForm();
    } catch (error) {
      if (activePage !== page) return;
      app.innerHTML = `<div class="loading">Halaman gagal dimuat. Jalankan menggunakan HTTP server (bukan klik file HTML langsung).<p>${safeText(error.message)}</p></div>`;
    }
  }

  async function initDashboard() {
    // Data dashboard dibaca dari localStorage dan data contoh (bukan angka statis).
    await Promise.all([getRooms(), getKos()]);
    const counts = { total: rooms.length, available: rooms.filter(r => r.status === 'tersedia').length, occupied: rooms.filter(r => r.status === 'terisi').length, maintenance: rooms.filter(r => r.status === 'perbaikan').length };
    for (const [key, value] of Object.entries(counts)) {
      const elem = document.querySelector(`#summary-${key}`);
      if (elem) elem.textContent = value;
    }
    const kosCount = document.querySelector('#summary-kos');
    if (kosCount) kosCount.textContent = `${kosList.length} KOS TERDAFTAR`;
  }

  function renderRoomList() {
    const tbody = document.querySelector('#room-body');
    if (!tbody) return;
    const chosen = document.querySelector('#select-kos-list')?.value || '';
    const kos = kosList.find(item => String(item.id_kos) === chosen);
    const panel = document.querySelector('#room-table-panel');
    const prompt = document.querySelector('#kos-prompt');
    panel.hidden = !kos;
    prompt.hidden = Boolean(kos);
    selectedKosId = kos ? Number(kos.id_kos) : null;
    // Daftar kamar menyimpan kos terpilih di URL, jadi refresh tidak mengosongkannya.
    if (activePage === 'kamar') {
      const newUrl = `?page=kamar${selectedKosId ? `&kos=${selectedKosId}` : ''}`;
      if (`${location.search}` !== newUrl) history.replaceState({ page: 'kamar' }, '', newUrl);
    }
    if (!kos) return;

    const query = document.querySelector('#search-room')?.value.trim().toLowerCase() || '';
    const status = document.querySelector('#filter-status')?.value || 'semua';
    const scoped = rooms.filter(room => Number(room.id_kos) === selectedKosId);
    const filtered = scoped.filter(room => room.nomor_kamar.toLowerCase().includes(query) && (status === 'semua' || room.status === status));
    tbody.innerHTML = filtered.length ? filtered.map(room => `<tr data-room-id="${Number(room.id_kamar)}" data-kos-id="${Number(room.id_kos)}">
      <td>#${Number(room.id_kamar)}</td>
      <td><strong>${safeText(room.nomor_kamar)}</strong></td>
      <td>${formatRupiah(Number(room.harga))}</td>
      <td><span class="status-pill status-${safeText(room.status)}">${roomStatuses[room.status] || safeText(room.status)}</span></td>
      <td>${safeText(nameOfKos(room.id_kos))}</td>
      <td><div class="status-edit">
        <select class="status-choice" aria-label="Ubah status kamar ${safeText(room.nomor_kamar)} di ${safeText(nameOfKos(room.id_kos))}">
          ${Object.entries(roomStatuses).map(([key, label]) => `<option value="${key}" ${room.status === key ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
        <button class="btn btn-primary btn-save-status" type="button" disabled>Simpan</button>
      </div><span class="status-message" aria-live="polite"></span></td>
    </tr>`).join('') : '<tr><td colspan="6" class="empty">Tidak ada kamar pada kos ini yang cocok dengan pencarian.</td></tr>';
    document.querySelector('#room-count').textContent = `${scoped.length} kamar di ${kos.nama_kos}`;
    document.querySelector('#selected-kos-name').textContent = kos.nama_kos;
    document.querySelector('#view-count').textContent = `Menampilkan ${filtered.length} dari ${scoped.length} kamar`;
  }

  async function updateRoomStatus(idKamar, idKos, status) {
    await getRooms();
    if (!Object.hasOwn(roomStatuses, status)) throw new Error('Status kamar tidak valid.');
    const index = rooms.findIndex(room => Number(room.id_kamar) === idKamar && Number(room.id_kos) === idKos);
    if (index < 0) throw new Error('Kamar tidak ditemukan di kos yang dipilih.');
    const updated = rooms.map((room, i) => i === index ? { ...room, status } : room);
    persistRooms(updated);
    return `Status kamar ${rooms[index].nomor_kamar} berhasil diubah menjadi ${roomStatuses[status]}.`;
  }

  async function saveStatusFromRow(row) {
    const idKamar = Number(row.dataset.roomId);
    const idKos = Number(row.dataset.kosId);
    const choice = row.querySelector('.status-choice');
    const button = row.querySelector('.btn-save-status');
    const message = row.querySelector('.status-message');
    const current = rooms.find(room => Number(room.id_kamar) === idKamar);
    if (!current || Number(current.id_kos) !== idKos || idKos !== selectedKosId || !Object.hasOwn(roomStatuses, choice.value)) return;
    if (current.status === choice.value) { button.disabled = true; return; }
    const nextStatus = choice.value;
    button.disabled = true;
    choice.disabled = true;
    button.textContent = 'Menyimpan…';
    message.textContent = '';
    try {
      const success = await updateRoomStatus(idKamar, idKos, nextStatus);
      await getRooms();
      if (activePage === 'kamar') renderRoomList();
      showToast(success);
    } catch (error) {
      if (!row.isConnected) return;
      message.textContent = error.message;
      message.classList.add('error');
      button.disabled = false;
    } finally {
      if (row.isConnected) {
        choice.disabled = false;
        button.textContent = 'Simpan';
      }
    }
  }

  async function initRoomList() {
    await Promise.all([getRooms(), getKos()]);
    if (activePage !== 'kamar') return;
    const select = document.querySelector('#select-kos-list');
    populateKosSelect(select);
    const kosFromUrl = Number(new URLSearchParams(location.search).get('kos')) || 0;
    const preferredKos = selectedKosAfterSave || kosFromUrl || selectedKosId;
    if (preferredKos && kosList.some(kos => Number(kos.id_kos) === preferredKos)) {
      select.value = String(preferredKos);
    }
    selectedKosAfterSave = null;
    select.addEventListener('change', () => {
      document.querySelector('#search-room').value = '';
      document.querySelector('#filter-status').value = 'semua';
      renderRoomList();
    });
    document.querySelector('#search-room').addEventListener('input', renderRoomList);
    document.querySelector('#filter-status').addEventListener('change', renderRoomList);
    const tbody = document.querySelector('#room-body');
    tbody.addEventListener('change', event => {
      if (!event.target.matches('.status-choice')) return;
      const row = event.target.closest('tr[data-room-id]');
      const original = rooms.find(room => Number(room.id_kamar) === Number(row?.dataset.roomId));
      if (!original) return;
      row.querySelector('.btn-save-status').disabled = original.status === event.target.value;
      row.querySelector('.status-message').textContent = '';
    });
    tbody.addEventListener('click', event => {
      const button = event.target.closest('.btn-save-status');
      if (button && !button.disabled) saveStatusFromRow(button.closest('tr[data-room-id]'));
    });
    renderRoomList();
  }

  function setFieldError(field, message) {
    const input = document.querySelector(`#${field}`);
    const error = document.querySelector(`#error-${field}`);
    if (input) { input.classList.toggle('invalid', Boolean(message)); input.setAttribute('aria-invalid', String(Boolean(message))); }
    if (error) error.textContent = message;
  }

  function validateRoom(data) {
    const errors = {};
    const number = String(data.nomor_kamar).trim();
    const price = Number(data.harga);
    const chosenKos = Number(data.id_kos);
    if (!String(data.id_kos).trim() || !kosList.some(kos => Number(kos.id_kos) === chosenKos)) errors.id_kos = 'Pilih salah satu nama kos.';
    if (!number) errors.nomor_kamar = 'Nomor kamar wajib diisi.';
    else if (!/^[a-zA-Z0-9\- ]{1,20}$/.test(number)) errors.nomor_kamar = 'Gunakan huruf, angka, spasi, atau tanda - (maks. 20 karakter).';
    else if (rooms.some(room => Number(room.id_kos) === chosenKos && room.nomor_kamar.toLowerCase() === number.toLowerCase())) errors.nomor_kamar = 'Nomor kamar sudah digunakan pada kos ini.';
    if (!String(data.harga).trim() || !Number.isSafeInteger(price) || price <= 0) errors.harga = 'Harga harus bilangan bulat positif.';
    return errors;
  }

  async function saveRoom(data) {
    await getRooms();
    await getKos();
    const errors = validateRoom(data);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const idKos = Number(data.id_kos);
    const number = String(data.nomor_kamar).trim();
    const nextId = Math.max(0, ...rooms.map(room => Number(room.id_kamar) || 0)) + 1;
    if (!Number.isSafeInteger(nextId)) throw new Error('ID kamar sudah melampaui batas yang didukung.');
    const item = { id_kamar: nextId, id_kos: idKos, nomor_kamar: number, harga: Number(data.harga), status: 'tersedia' };
    persistRooms([...rooms, item]);
    return { ok: true, data: item, message: `Kamar ${number} berhasil ditambahkan.` };
  }

  async function initRoomForm() {
    await Promise.all([getRooms(), getKos()]);
    if (activePage !== 'tambah-kamar') return;
    const form = document.querySelector('#room-form');
    populateKosSelect(document.querySelector('#id_kos'));
    const feedback = document.querySelector('#form-feedback');
    form.addEventListener('reset', () => {
      setTimeout(() => {
        for (const name of ['id_kos','nomor_kamar','harga']) setFieldError(name, '');
        feedback.textContent = '';
      }, 0);
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      feedback.textContent = '';
      feedback.className = 'form-feedback';
      const data = Object.fromEntries(new FormData(form).entries());
      for (const name of ['id_kos','nomor_kamar','harga']) setFieldError(name, '');
      const errors = validateRoom(data);
      for (const [field, message] of Object.entries(errors)) setFieldError(field, message);
      if (Object.keys(errors).length) {
        feedback.textContent = 'Periksa kembali data yang ditandai merah.';
        feedback.classList.add('error');
        return;
      }
      const button = document.querySelector('#submit-room');
      button.disabled = true;
      button.textContent = 'Menyimpan…';
      try {
        const result = await saveRoom(data);
        // Pastikan data benar-benar tersimpan dan bisa dibaca kembali dari localStorage.
        await getRooms();
        const stored = rooms.find(room =>
          Number(room.id_kamar) === Number(result.data.id_kamar) &&
          Number(room.id_kos) === Number(data.id_kos) &&
          String(room.nomor_kamar).toLowerCase() === String(data.nomor_kamar).trim().toLowerCase()
        );
        if (!stored) {
          throw new Error('Kamar baru belum terbaca kembali dari localStorage.');
        }
        selectedKosId = Number(data.id_kos);
        selectedKosAfterSave = selectedKosId;
        form.reset();
        showToast(`Kamar ${stored.nomor_kamar} berhasil masuk ke ${nameOfKos(stored.id_kos)}.`);
        // Langsung tampilkan kos yang benar beserta kamar terbaru tanpa memilih ulang.
        await changePage('kamar');
      } catch (error) {
        feedback.textContent = error.message;
        feedback.classList.add('error');
      } finally {
        button.disabled = false;
        button.textContent = 'Simpan Kamar →';
      }
    });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-page]');
    const action = event.target.closest('[data-go-page]');
    if (link) { event.preventDefault(); changePage(link.dataset.page); }
    else if (action) { event.preventDefault(); changePage(action.dataset.goPage); }
  });
  document.querySelector('#menu-toggle').addEventListener('click', () => {
    const sidebar = document.querySelector('#sidebar');
    const nowOpen = sidebar.classList.toggle('is-open');
    document.querySelector('#menu-toggle').setAttribute('aria-expanded', String(nowOpen));
  });
  document.addEventListener('click', event => {
    const sidebar = document.querySelector('#sidebar');
    if (sidebar.classList.contains('is-open') && !sidebar.contains(event.target) && !event.target.closest('#menu-toggle')) {
      sidebar.classList.remove('is-open');
      document.querySelector('#menu-toggle').setAttribute('aria-expanded','false');
    }
  });
  window.addEventListener('popstate', () => {
    const param = new URLSearchParams(location.search).get('page') || 'beranda';
    changePage(param, false);
  });
  document.querySelector('#today-date').textContent = new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(new Date());
  changePage(new URLSearchParams(location.search).get('page') || 'beranda', false);
})();
