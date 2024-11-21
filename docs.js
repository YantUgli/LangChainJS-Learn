import fs from 'fs'; // Impor modul fs dengan ESM
const filePath = './questions.json'; // Lokasi file JSON untuk menyimpan data

// Fungsi untuk membaca data dari file JSON
function loadQuestions() {
    if (!fs.existsSync(filePath)) {
        return { questions: [] }; // Jika file tidak ada, kembalikan data kosong
    }
    const data = fs.readFileSync(filePath, 'utf-8'); // Membaca isi file
    return JSON.parse(data); // Mengubah string JSON menjadi objek
}

// Fungsi untuk menyimpan data ke file JSON
function saveQuestions(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8'); // Menulis data ke file
}

// Fungsi untuk menambahkan pertanyaan ke daftar
function addQuestion(question) {
    const data = loadQuestions(); // Baca data dari file
    if (!data.questions.includes(question)) {
        data.questions.push(question); // Tambahkan pertanyaan jika belum ada
        saveQuestions(data); // Simpan kembali ke file
        console.log("Pertanyaan berhasil ditambahkan:", question);
    } else {
        console.log("Pertanyaan sudah ada:", question);
    }
}

// Fungsi untuk menghapus pertanyaan dari daftar
function deleteQuestion(question) {
    const data = loadQuestions(); // Baca data dari file
    const index = data.questions.indexOf(question);
    if (index !== -1) {
        data.questions.splice(index, 1); // Hapus pertanyaan berdasarkan indeks
        saveQuestions(data); // Simpan kembali ke file
        console.log("Pertanyaan berhasil dihapus:", question);
    } else {
        console.log("Pertanyaan tidak ditemukan:", question);
    }
}

// Fungsi untuk menampilkan semua pertanyaan
function viewQuestions() {
    const data = loadQuestions(); // Baca data dari file
    console.log("Daftar Pertanyaan:");
    data.questions.forEach((q, index) => console.log(`${index + 1}. ${q}`)); // Tampilkan setiap pertanyaan
}

// Simulasi penggunaan fungsi
addQuestion("Bagaimana Admin bekerja?");
addQuestion("Apa itu LangChain?");
viewQuestions(); // Menampilkan semua pertanyaan
deleteQuestion();
viewQuestions(); // Menampilkan daftar pertanyaan setelah penghapusan
