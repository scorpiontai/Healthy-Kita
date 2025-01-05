import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai"
import { SystemGateway } from '../system/system.gateway';
dotenv.config({ path: resolve('./src/.env') });

@Injectable()
export class GeminiService {
    private genAi: any;
    private model: any;

    constructor(private readonly systemGatewaySocket: SystemGateway) {
        this.genAi = new GoogleGenerativeAI(process.env.GEMINI_AI);
        this.model = this.genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async sender(name: string, age: number, tall: number, intensActivity: number): Promise<any> {
        try {
            let prompting = `Hai, saya adalah ${name} saat ini saya berumur ${age}. Tinggi saya ${tall}, 
            Saya memiliki intensitas aktvitas fisik ${intensActivity} kali bergereak aktif dalam seminggu
            saat ini saya ingin mendapatkan 10 soal untuk memantau kesehatan mental saya, berikan saya dalam format array, ingat ya hanya pertanyaan aja tanpa ada opsi jawaban
            jadai cuman judul pertanyaan aja dalam array urut per index. Harap juga pertanyakan pertanyaan seputar kesehatan fisik sebagai selingan bila anda rasa tinggi,umur,berat badan saya tidak ideal`

            let result: any = await this.model.generateContent(prompting)

            const allResults: any = new Promise(async (resolve, reject) => {
                try {
                    resolve(result.response.text())
                } catch (error) {
                    reject(error.message)
                    console.error(error.message)
                }
            })

            const question = this.model.generateContent(prompting).then(result => {
                return { message: result.response.text() }
            })

            const allResultss = await Promise.all([question])
            return allResultss[0]
        } catch (error) {
            console.error(error.message)
        }
    }

    async sendInUseCache(name: string, age: number, weight: number, tall: number, intensActivity: number, payloadCache: [string]): Promise<any> {
        try {
            let prompting = `Hai, saya adalah ${name} saat ini saya berumur ${age} dengan berat badan ${weight} kg dan tinggi ${tall} cm.
            saya beraktivitas dengan intensitas ${intensActivity} aktif perminggu
            buatkan saya pertanyaan yang lain selain dari pertanyaan berikut untuk pertanyaan seputar kesehatan mental saya, pertanyaan
            harus berbeda dari daftar ini:
            ${payloadCache} tapi saling berkaitan, kirim dalam bentuk format seperti ini
            [pertanyaan] dan dibawhnya baru daftar pertanyaan berbentuk array semuanya dan jangan ada basa basi, langsung kirim
            tapi saya mendapati akhir akhir ini anda tetap mengirim soal yang sama, jadi tolong bedakan ya setiap saya miinta beda
            
             Harap juga pertanyakan pertanyaan seputar kesehatan fisik sebagai selingan bila anda rasa tinggi,umur,berat badan saya tidak ideal
            |terimakasih!`

            let result: any = await this.model.generateContent(prompting)

            const question = this.model.generateContent(prompting).then(result => {
                return { message: result.response.text() }
            })

            const allResults = await Promise.all([question])
            return allResults[0]
        } catch (error) {
            console.error(error.message)
        }
    }

    async calculationQuest(userIDEnc: string, payload: any): Promise<any> {
        try {
            let prompting = `Anda sebelum-sebelumnya sudah berbaik hati ke saya memberikan pertanyaan untuk nanti asya jawab sebagai pengukuran
                tes kesehatan mental saya, maka dari itu ini adalah apa yang saya punya, tolonh analisiskan ini audit kesehatan mental berdasarkan tingkatan/range
                dengan masing-masing pertanyaan ini: 
        
                ${payload} || setelah menganalisa harap laporkan semua hasil analitik anda secara singkat dan potensi penyakit apa saja yang datang 
                dari masalah mental saya. Tapi bila hasil analitiknya malah tidak ada masalah mental berikan saya pujian dan tips untuk mempertahankan semua ini
        
                saya mau hasil analisis di deskripsikan saja, tidak usah bertele tele setelah di deskripsikan masalah saya bila ada tapi bila gak langsung deskripsikan pesan moral dan nasehat
                kelompokkan hasil analitik dalam format seperti ini
        
                [massalah mental]
                [kaitannya dengan kesehatan fisik]
                [rekomendasi]   
        
                Kirim balasan dalam bentuk response teks obrolan biasa aja dengan berparagraf,
                `

            const generateContentPromise = this.model.generateContent(prompting).then(result => {
                return { message: result.response.text(), userIDEnc: userIDEnc }
            })

            const allResults = await Promise.all([generateContentPromise])

            return allResults[0]
        } catch (error) {
            console.error(error.message)
        }
    }
}
