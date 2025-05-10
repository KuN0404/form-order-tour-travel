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

const tujuanSelect = document.getElementById('tujuan');
const mobilSelect = document.getElementById('mobil');

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
    const tujuan = tujuanSelect.value;
    const mobil = mobilSelect.value;

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
      await Swal.fire('Tujuan Kosong', 'Mohon pilih tujuan.', 'warning');
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

    const data = new URLSearchParams(formData);
    const response = await fetch('https://script.google.com/macros/s/AKfycbw5ULQrtZxvCkpSUa3wOH9Hsy7ULWqimBGtPnys04Rr7jPX2ny_I6B1KVv6Egh80YgV/exec', {
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

      // Buka SPK dalam tab baru
      if (result.spkUrl) {
        window.open(result.spkUrl, '_blank');
      }

      // Reset form
      form.reset();

      // Tetap buka surat asuransi jika dipilih
      if (isAsuransi && isAsuransi.value === 'Ya') {
        const id_order = result.id;
        const nama = encodeURIComponent(formData.get('penyewa'));
        const suratUrl = `https://kun0404.github.io/form-order-tour-travel/surat-asuransi.html?id_order=${id_order}&nama=${nama}`;
        window.open(suratUrl, '_blank');
      }
    } else {
      throw new Error(result.error || 'Terjadi kesalahan saat mengirim data');
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

  submitButton.disabled = false;
  submitButton.textContent = 'Kirim Form';
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
// // const tujuanLainnyaInput = document.getElementById('tujuan_lainnya');
// // const tujuanLainnyaContainer = document.getElementById('tujuan_lainnya_container');
// const mobilSelect = document.getElementById('mobil');

// // tujuanSelect.addEventListener('change', () => {
// //   if (tujuanSelect.value === 'Lainnya') {
// //     tujuanLainnyaContainer.classList.add('show');
// //     tujuanLainnyaInput.required = true;
// //   } else {
// //     tujuanLainnyaContainer.classList.remove('show');
// //     tujuanLainnyaInput.required = false;
// //   }
// // });

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
//     // const tujuanLainnyaVal = tujuanLainnyaInput.value.trim();
//     const mobil = mobilSelect.value;

//     if (!tgl) {
//       await Swal.fire('Tanggal Kosong', 'Mohon pilih tanggal keberangkatan.', 'warning');
//       return;
//     }

//     if (!jam) {
//       await Swal.fire('Jam Kosong', 'Mohon isi jam penjemputan.', 'warning');
//       return;
//     }

//     if (!tujuan) {
//       await Swal.fire('Tujuan Kosong', 'Mohon pilih tujuan.', 'warning');
//       return;
//     }

//     // if (tujuan === 'Lainnya' && !tujuanLainnyaVal) {
//     //   await Swal.fire('Tujuan Lainnya Kosong', 'Mohon isi tujuan secara manual.', 'warning');
//     //   return;
//     // }

//     if (!mobil) {
//       await Swal.fire('Mobil tidak dipilih', 'Mohon pilih mobil.', 'warning');
//       return;
//     }

//     const noHp = formData.get('no_hp');
//     formData.set('no_hp', `'${noHp}`);

//     // if (tujuanSelect.value === 'Lainnya') {
//     //   const inputLainnya = tujuanLainnyaInput.value.trim();
//     //   if (inputLainnya) {
//     //     formData.set('tujuan', inputLainnya);
//     //   }
//     // }

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
//       form.reset();
//       tujuanLainnyaContainer.classList.add('d-none');

//       if (formData.get('is_asuransi') === 'Ya') {
//         const id_order = result.id; // ID dari Google Spreadsheet
//         const nama = encodeURIComponent(formData.get('penyewa')); // Nama dari form input
//         const suratUrl = `https://kun0404.github.io/form-order-tour-travel/surat-asuransi.html?id_order=${id_order}&nama=${nama}`;
//         window.open(suratUrl, '_blank');
//       }
//     } else {
//       throw new Error(result.error);
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

//   setTimeout(() => {
//     submitButton.disabled = false;
//     submitButton.textContent = 'Kirim Form';
//   }, 3000);
// });
