import fs from 'fs';
import { OpenAI } from 'openai'; // Pastikan Anda import dengan benar
import dotenv from 'dotenv';
dotenv.config();  // Memuat variabel lingkungan dari file .env

const filePath = './questions.json';

// Konfigurasi OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // API key
});

// Fungsi untuk membaca data dari file JSON
function loadQuestions() {
    if (!fs.existsSync(filePath)) {
        return { questions: [] };
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Fungsi untuk menyimpan data ke file JSON
function saveQuestions(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Fungsi untuk menghasilkan pertanyaan menggunakan OpenAI
async function generateQuestions(prompt, role, jenjang, numQuestions = 5) {
    try {
        // Menambahkan role dan jenjang ke dalam prompt untuk menghasilkan pertanyaan yang lebih spesifik
        const detailedPrompt = `${prompt} untuk role ${role} di jenjang ${jenjang}. Generate ${numQuestions} frequently asked questions.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',  // Model yang digunakan
            messages: [
                {
                    role: 'system',
                    content: "You are a helpful assistant that generates frequently asked questions (FAQs) on a given topic.",
                },
                {
                    role: 'user',
                    content: detailedPrompt,
                },
            ],
            max_tokens: 500,
        });

        // Ambil pertanyaan dari hasil dan buang nomor
        const questions = response.choices[0].message.content
            .split('\n')
            .filter(Boolean)
            .map(question => question.replace(/^\d+\.\s*/, '').trim());  // Menghapus angka dan spasi di awal

        return questions;
    } catch (error) {
        console.error("Error generating questions:", error.message);
        return [];
    }
}

// Fungsi untuk menambahkan pertanyaan hasil AI ke file untuk role tertentu
async function addGeneratedQuestions(prompt, role, jenjang) {
    const existingData = loadQuestions();
    const newQuestions = await generateQuestions(prompt, role, jenjang);

    newQuestions.forEach(question => {
        if (!existingData.questions.some(q => q.question === question && q.role === role && q.jenjang === jenjang)) {
            existingData.questions.push({ question, role, jenjang });
        }
    });

    saveQuestions(existingData);
    console.log(`Pertanyaan untuk ${role} di jenjang ${jenjang} berhasil ditambahkan:`, newQuestions);
}

// Contoh penggunaan
(async () => {
    try {
        console.log("Mulai menambahkan pertanyaan...");
        const topic = "Buat Pertanyaan untuk";
        const role = "guru";  // Menentukan role, bisa admin_sekolah, kepsek, guru, murid
        const jenjang = "SMA";  // Menentukan jenjang sekolah, bisa SMP, SMA, SD, dll
        await addGeneratedQuestions(topic, role, jenjang);
        console.log("Selesai menambahkan pertanyaan!");
    } catch (error) {
        console.error("Error saat menjalankan script: ", error.message);
    }
})();
