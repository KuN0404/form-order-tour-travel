const form = document.getElementById('contactForm');
const submitButton = document.getElementById('submitButton');

// Format angka ke format "1.000.000"
function formatRupiah(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseRupiah(rp) {
  return parseInt(rp.replace(/\./g, '')) || 0;
}

function setupRupiahInput(id) {
  const input = document.getElementById(id);
  input.addEventListener('input', () => {
    const raw = input.value.replace(/\D/g, '');
    input.value = formatRupiah(raw);
  });
  input.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(String.fromCharCode(e.which))) {
      e.preventDefault();
    }
  });
}

const noHpInput = document.getElementById('no_hp');

noHpInput.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, ''); // Hapus semua non-digit
});

noHpInput.addEventListener('keypress', function (e) {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault(); // Cegah karakter selain angka
  }
});

const uangInputs = ['dp', 'sisa'];
uangInputs.forEach(setupRupiahInput);

flatpickr('#tgl_keberangkatan', {
  dateFormat: 'Y-m-d',
  minDate: 'today',
});

flatpickr('#jam_penjemputan', {
  enableTime: true,
  noCalendar: true,
  dateFormat: 'H:i',
  time_24hr: true,
});

const tujuanSelect = document.getElementById('tujuan');
const tujuanLainnyaInput = document.getElementById('tujuan_lainnya');
const tujuanLainnyaContainer = document.getElementById('tujuan_lainnya_container');
const mobilSelect = document.getElementById('mobil');

tujuanSelect.addEventListener('change', () => {
  if (tujuanSelect.value === 'Lainnya') {
    tujuanLainnyaContainer.classList.add('show');
    tujuanLainnyaInput.required = true;
  } else {
    tujuanLainnyaContainer.classList.remove('show');
    tujuanLainnyaInput.required = false;
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const confirm = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: 'Data akan dikirim!',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, kirim',
    cancelButtonText: 'Batal',
  });

  if (!confirm.isConfirmed) return;

  submitButton.disabled = true;
  submitButton.textContent = 'Mengirim...';

  // Parse angka mentah dulu
  uangInputs.forEach((id) => {
    const el = document.getElementById(id);
    el.value = parseRupiah(el.value);
  });

  try {
    const formData = new FormData(form);

    const tgl = document.getElementById('tgl_keberangkatan').value.trim();
    const jam = document.getElementById('jam_penjemputan').value.trim();
    const tujuan = tujuanSelect.value;
    const tujuanLainnyaVal = tujuanLainnyaInput.value.trim();
    const mobil = mobilSelect.value;

    // Validasi field wajib
    if (!tgl) {
      await Swal.fire('Tanggal Kosong', 'Mohon pilih tanggal keberangkatan.', 'warning');
      return;
    }

    if (!jam) {
      await Swal.fire('Jam Kosong', 'Mohon isi jam penjemputan.', 'warning');
      return;
    }

    if (!tujuan) {
      await Swal.fire('Tujuan Kosong', 'Mohon pilih tujuan.', 'warning');
      return;
    }

    if (tujuan === 'Lainnya' && !tujuanLainnyaVal) {
      await Swal.fire('Tujuan Lainnya Kosong', 'Mohon isi tujuan secara manual.', 'warning');
      return;
    }

    if (!mobil) {
      await Swal.fire('Mobil tidak dipilih', 'Mohon pilih mobil.', 'warning');
      return;
    }

    const noHp = formData.get('no_hp');
    formData.set('no_hp', `'${noHp}`);

    // Tangani input tujuan lainnya
    if (tujuanSelect.value === 'Lainnya') {
      const inputLainnya = tujuanLainnyaInput.value.trim();
      if (inputLainnya) {
        formData.set('tujuan', inputLainnya); // Timpa langsung isi tujuan
      }
    }

    // Pastikan radio asuransi ikut dikirim
    const isAsuransi = form.querySelector('input[name="is_asuransi"]:checked');
    if (isAsuransi) {
      formData.set('is_asuransi', isAsuransi.value);
    }

    const data = new URLSearchParams(formData);
    const response = await fetch('https://script.google.com/macros/s/AKfycbwMYDFbqlqHOBZm1PBBcZYOe-F3Mpk5uadoHMbRAthYeNzElPENfmqtJ8LTuZcKTaRM/exec', {
      method: 'POST',
      body: data,
    });

    const result = await response.json();

    if (result.result === 'success') {
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: '✅ Data berhasil dikirim.',
        confirmButtonText: 'OK',
      });
      form.reset();
      tujuanLainnyaContainer.classList.add('d-none'); // Sembunyikan kembali jika sebelumnya dibuka
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(error);
    await Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: '❌ Tidak dapat mengirim data. Silakan coba lagi.',
      confirmButtonText: 'OK',
    });
  }

  setTimeout(() => {
    submitButton.disabled = false;
    submitButton.textContent = 'Kirim Form';
  }, 3000);
});
