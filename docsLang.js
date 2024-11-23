import fs from 'fs';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';

dotenv.config();

const filePath = './questions.json';

// Konfigurasi OpenAI dengan LangChain
const openai = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY, // Ambil API key dari env
    modelName: 'gpt-3.5-turbo', // Model yang digunakan
    temperature: 0.7, // Penyesuaian kreativitas output
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

// Fungsi untuk menghasilkan pertanyaan menggunakan LangChain
async function generateQuestions(role, tingkat = null, numQuestions = 1) {
    try {
        const template = tingkat
            ? `Buat {numQuestions} pertanyaan umum untuk role {role} di tingkat {tingkat}. Jawaban harus singkat tanpa simbol tambahan seperti ** - atau lainnya.`
            : `Buat {numQuestions} pertanyaan umum untuk role {role}. Jawaban harus singkat tanpa simbol tambahan seperti ** - atau lainnya.`;

        const prompt = ChatPromptTemplate.fromTemplate(template);

        const chain = prompt.pipe(openai);

        // Eksekusi prompt
        const response = await chain.invoke({
            numQuestions,
            role,
            tingkat,
        });

        // Periksa struktur respons dan ekstrak teks
        const responseText = response.text || response; // Jika respons berupa objek, ambil properti `text`

        // Parsing hasil menjadi array pertanyaan
        const questions = responseText
            .split('\n')
            .filter(Boolean)
            .map((question) =>
                question
                    .replace(/^\d+\.\s*/, '')
                    .trim()
            );

        console.log('Raw response:', responseText);
        return questions;
    } catch (error) {
        console.error('Error generating questions:', error.message);
        return [];
    }
}


// Fungsi untuk menambahkan pertanyaan hasil AI ke file untuk role tertentu
async function addGeneratedQuestions(role, tingkat = null) {
    const existingData = loadQuestions();
    const newQuestions = await generateQuestions(role, tingkat);

    newQuestions.forEach((question) => {
        if (!existingData.questions.some((q) => q.question === question && q.role === role && q.tingkat === tingkat)) {
            existingData.questions.push({ question, role, tingkat });
        }
    });

    saveQuestions(existingData);
    console.log(`Pertanyaan untuk ${role}${tingkat ? ` di tingkat ${tingkat}` : ''} berhasil ditambahkan:`, newQuestions);
}

// Fungsi utama untuk memproses semua role dan tingkat
(async () => {
    try {
        console.log('Mulai menambahkan pertanyaan...');

        const rolesWithLevels = ['guru', 'murid'];
        const rolesWithoutLevels = ['admin', 'kepsek'];
        const tingkatList = ['SD', 'SMP', 'SMA', 'SMK'];

        // Loop untuk role dengan tingkat
        for (const role of rolesWithLevels) {
            for (const tingkat of tingkatList) {
                await addGeneratedQuestions(role, tingkat);
            }
        }

        // Loop untuk role tanpa tingkat
        for (const role of rolesWithoutLevels) {
            await addGeneratedQuestions(role);
        }

        const lookQ = loadQuestions();
        console.log('List Semua pertanyaan', lookQ);

        console.log('Selesai menambahkan semua pertanyaan!');
    } catch (error) {
        console.error('Error saat menjalankan script: ', error.message);
    }
})();
