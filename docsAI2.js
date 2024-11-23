import fs from 'fs';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const filePath = './questions.json';

// Konfigurasi OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
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
async function generateQuestions(prompt, role, tingkat = null, numQuestions = 1) {
    try {
        // Menambahkan tingkat ke dalam prompt hanya jika tingkat ada
        const detailedPrompt = tingkat
            ? `${prompt} untuk role ${role} di tingkat ${tingkat}. Generate only ${numQuestions} frequently asked questions, dont answer, dont answer the question. jawab langsung tanpa perlu tanda baca tambahan seperti ** - atau yang lainnya`
            : `${prompt} untuk role ${role}. Generate only ${numQuestions} frequently asked questions, dont answer the question. jawab langsung tanpa perlu tanda baca tambahan seperti ** - atau yang lainnya`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Model yang digunakan
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
            // max_tokens: 500,
        });


        const questions = response.choices[0].message.content
            .split('\n')
            .filter(Boolean)
            .map(question =>
                question
                    .replace(/^\d+\.\s*/, '')
                    .replace(/\*\*/g, '') // Menghapus semua tanda bintang
                    .trim()
            );
        console.log('Raw response:', response.choices[0].message.content, "Response: ", response);
        return questions;
    } catch (error) {
        console.error("Error generating questions:", error.message);
        return [];
    }
}

// Fungsi untuk menambahkan pertanyaan hasil AI ke file untuk role tertentu
async function addGeneratedQuestions(prompt, role, tingkat = null) {
    const existingData = loadQuestions();
    const newQuestions = await generateQuestions(prompt, role, tingkat);

    newQuestions.forEach(question => {
        if (!existingData.questions.some(q => q.question === question && q.role === role && q.tingkat === tingkat)) {
            existingData.questions.push({ question, role, tingkat });
        }
    });

    saveQuestions(existingData);
    console.log(`Pertanyaan untuk ${role}${tingkat ? ` di tingkat ${tingkat}` : ''} berhasil ditambahkan:`, newQuestions);
}

// Fungsi utama untuk memproses semua role dan tingkat
(async () => {
    try {
        console.log("Mulai menambahkan pertanyaan...");

        const topic = "Buat Pertanyaan untuk";
        const rolesWithLevels = ["guru", "murid"];
        const rolesWithoutLevels = ["admin", "kepsek"];
        const tingkatList = ["SD", "SMP", "SMA", "SMK"];

        // Loop untuk role dengan tingkat
        for (const role of rolesWithLevels) {
            for (const tingkat of tingkatList) {
                await addGeneratedQuestions(topic, role, tingkat);
            }
        }

        // Loop untuk role tanpa tingkat
        for (const role of rolesWithoutLevels) {
            await addGeneratedQuestions(topic, role);
        }

        const lookQ = loadQuestions()
        console.log("List Semua pertanyaan", lookQ);

        console.log("Selesai menambahkan semua pertanyaan!");
    } catch (error) {
        console.error("Error saat menjalankan script: ", error.message);
    }
})();



