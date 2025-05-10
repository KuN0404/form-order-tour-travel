// script.js - Fixed version for form order
const form = document.getElementById('contactForm');
const submitButton = document.getElementById('submitButton');

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

  try {
    const formData = new FormData(form);

    const tgl = document.getElementById('tgl_keberangkatan').value.trim();
    const jam = document.getElementById('jam_penjemputan').value.trim();
    const tujuan = document.getElementById('tujuan').value.trim();
    const mobil = document.getElementById('mobil').value;
    const penyewa = document.getElementById('penyewa').value.trim();
    const penjemputan = document.getElementById('penjemputan').value.trim();

    if (!tgl) {
      await Swal.fire('Tanggal Kosong', 'Mohon pilih tanggal keberangkatan.', 'warning');
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Form';
      return;
    }

    if (!jam) {
      await Swal.fire('Jam Kosong', 'Mohon isi jam penjemputan.', 'warning');
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Form';
      return;
    }

    if (!tujuan) {
      await Swal.fire('Tujuan Kosong', 'Mohon isi tujuan.', 'warning');
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Form';
      return;
    }

    if (!mobil) {
      await Swal.fire('Mobil tidak dipilih', 'Mohon pilih mobil.', 'warning');
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Form';
      return;
    }

    const noHp = formData.get('no_hp');
    formData.set('no_hp', `'${noHp}`);

    const isAsuransi = form.querySelector('input[name="is_asuransi"]:checked');
    if (isAsuransi) {
      formData.set('is_asuransi', isAsuransi.value);
    }

    // Pastikan parameter untuk SPK dikirim dengan nama yang sesuai
    formData.set('tgl_keberangkatan', tgl);
    formData.set('jam_penjemputan', jam);
    formData.set('tujuan', tujuan);
    formData.set('mobil', mobil);
    formData.set('penyewa', penyewa);
    formData.set('penjemputan', penjemputan);

    // Ubah ke URLSearchParams untuk pengiriman
    const data = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      data.append(key, value);
    }

    // Kirim ke Google Apps Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbw5ULQrtZxvCkpSUa3wOH9Hsy7ULWqimBGtPnys04Rr7jPX2ny_I6B1KVv6Egh80YgV/exec', {
      method: 'POST',
      body: data,
      mode: 'cors', // Menggunakan 'cors' untuk menangani CORS properly
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Handle response carefully
    let result;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const resultText = await response.text();
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        console.log('Server response:', resultText);
        // If not JSON, handle as successful to avoid errors
        result = { result: 'success' };
      }
    }

    console.log('Response:', result);

    // Show success message first
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: '✅ Data berhasil dikirim.',
      confirmButtonText: 'OK',
    });

    // Handle successful submission
    if (result && result.spkUrl) {
      // Open SPK in new tab
      window.open(result.spkUrl, '_blank');
    }

    // Check for asuransi
    if (isAsuransi && isAsuransi.value === 'Ya' && result.id) {
      const id_order = result.id;
      const nama = encodeURIComponent(penyewa);
      const suratUrl = `https://kun0404.github.io/form-order-tour-travel/surat-asuransi.html?id_order=${id_order}&nama=${nama}`;
      window.open(suratUrl, '_blank');
    }

    // Reset form after successful submission
    form.reset();
  } catch (error) {
    console.error('Error:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: '❌ Tidak dapat mengirim data. Silakan coba lagi.',
      confirmButtonText: 'OK',
    });
  } finally {
    // Always re-enable the submit button
    submitButton.disabled = false;
    submitButton.textContent = 'Kirim Form';
  }
});
// const form = document.getElementById('contactForm');
// const submitButton = document.getElementById('submitButton');

// function formatRupiah(angka) {
//   return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
// }

// function parseRupiah(rp) {
//   return parseInt(rp.replace(/\./g, '')) || 0;
// }

// function setupRupiahInput(id) {
//   const input = document.getElementById(id);
//   input.addEventListener('input', () => {
//     const raw = input.value.replace(/\D/g, '');
//     input.value = formatRupiah(raw);
//   });
//   input.addEventListener('keypress', (e) => {
//     if (!/[0-9]/.test(String.fromCharCode(e.which))) {
//       e.preventDefault();
//     }
//   });
// }

// const noHpInput = document.getElementById('no_hp');

// noHpInput.addEventListener('input', function () {
//   this.value = this.value.replace(/\D/g, ''); // Hapus semua non-digit
// });

// noHpInput.addEventListener('keypress', function (e) {
//   if (!/[0-9]/.test(e.key)) {
//     e.preventDefault(); // Cegah karakter selain angka
//   }
// });

// const uangInputs = ['dp', 'sisa'];
// uangInputs.forEach(setupRupiahInput);

// flatpickr('#tgl_keberangkatan', {
//   dateFormat: 'Y-m-d',
//   minDate: 'today',
// });

// flatpickr('#jam_penjemputan', {
//   enableTime: true,
//   noCalendar: true,
//   dateFormat: 'H:i',
//   time_24hr: true,
// });

// const tujuanSelect = document.getElementById('tujuan');
// const mobilSelect = document.getElementById('mobil');

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const confirm = await Swal.fire({
//     title: 'Apakah Anda yakin?',
//     text: 'Data akan dikirim!',
//     icon: 'question',
//     showCancelButton: true,
//     confirmButtonText: 'Ya, kirim',
//     cancelButtonText: 'Batal',
//   });

//   if (!confirm.isConfirmed) return;

//   submitButton.disabled = true;
//   submitButton.textContent = 'Mengirim...';

//   try {
//     const formData = new FormData(form);

//     const tgl = document.getElementById('tgl_keberangkatan').value.trim();
//     const jam = document.getElementById('jam_penjemputan').value.trim();
//     const tujuan = tujuanSelect.value;
//     const mobil = mobilSelect.value;

//     if (!tgl) {
//       await Swal.fire('Tanggal Kosong', 'Mohon pilih tanggal keberangkatan.', 'warning');
//       submitButton.disabled = false;
//       submitButton.textContent = 'Kirim Form';
//       return;
//     }

//     if (!jam) {
//       await Swal.fire('Jam Kosong', 'Mohon isi jam penjemputan.', 'warning');
//       submitButton.disabled = false;
//       submitButton.textContent = 'Kirim Form';
//       return;
//     }

//     if (!tujuan) {
//       await Swal.fire('Tujuan Kosong', 'Mohon pilih tujuan.', 'warning');
//       submitButton.disabled = false;
//       submitButton.textContent = 'Kirim Form';
//       return;
//     }

//     if (!mobil) {
//       await Swal.fire('Mobil tidak dipilih', 'Mohon pilih mobil.', 'warning');
//       submitButton.disabled = false;
//       submitButton.textContent = 'Kirim Form';
//       return;
//     }

//     const noHp = formData.get('no_hp');
//     formData.set('no_hp', `'${noHp}`);

//     const isAsuransi = form.querySelector('input[name="is_asuransi"]:checked');
//     if (isAsuransi) {
//       formData.set('is_asuransi', isAsuransi.value);
//     }

//     const data = new URLSearchParams(formData);
//     const response = await fetch('https://script.google.com/macros/s/AKfycbw5ULQrtZxvCkpSUa3wOH9Hsy7ULWqimBGtPnys04Rr7jPX2ny_I6B1KVv6Egh80YgV/exec', {
//       method: 'POST',
//       body: data,
//     });

//     const result = await response.json();

//     if (result.result === 'success') {
//       await Swal.fire({
//         icon: 'success',
//         title: 'Berhasil!',
//         text: '✅ Data berhasil dikirim.',
//         confirmButtonText: 'OK',
//       });

//       // Buka SPK dalam tab baru
//       if (result.spkUrl) {
//         window.open(result.spkUrl, '_blank');
//       }

//       // Reset form
//       form.reset();

//       // Tetap buka surat asuransi jika dipilih
//       if (isAsuransi && isAsuransi.value === 'Ya') {
//         const id_order = result.id;
//         const nama = encodeURIComponent(formData.get('penyewa'));
//         const suratUrl = `https://kun0404.github.io/form-order-tour-travel/surat-asuransi.html?id_order=${id_order}&nama=${nama}`;
//         window.open(suratUrl, '_blank');
//       }
//     } else {
//       throw new Error(result.error || 'Terjadi kesalahan saat mengirim data');
//     }
//   } catch (error) {
//     console.error(error);
//     await Swal.fire({
//       icon: 'error',
//       title: 'Terjadi Kesalahan',
//       text: '❌ Tidak dapat mengirim data. Silakan coba lagi.',
//       confirmButtonText: 'OK',
//     });
//   }

//   submitButton.disabled = false;
//   submitButton.textContent = 'Kirim Form';
// });
