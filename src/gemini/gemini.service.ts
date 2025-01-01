import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai"
import { SystemGateway } from '../system/system.gateway';
import { rejects } from 'assert';
dotenv.config({ path: resolve('./src/.env') });

@Injectable()
export class GeminiService {
    private genAi: any;
    private model: any;

    constructor(private readonly systemGatewaySocket: SystemGateway) {
        this.genAi = new GoogleGenerativeAI(process.env.GEMINI_AI);
        this.model = this.genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async sender(name: string, age: number, intensActivity: number): Promise<any> {
        try {
            let prompting = `Hai, saya adalah ${name} saat ini saya berumur ${age}. Saya memiliki intensitas aktvitas fisik ${intensActivity} kali bergereak aktif dalam seminggu
            saat ini saya ingin mendapatkan 10 soal untuk memantau kesehatan mental saya, berikan saya dalam format array, ingat ya hanya pertanyaan aja tanpa ada opsi jawaban
            jadai cuman judul pertanyaan aja dalam array urut per index`

            let result: any = await this.model.generateContent(prompting)

            const allResults: any = new Promise(async (resolve, reject) => {
                try {
                    resolve(result.response.text())
                } catch (error) {
                    reject(error.message)
                    console.error(error.message)
                }
            })

            return allResults
        } catch (error) {
            console.error(error.message)
        }
    }

    async sendInUseCache(name: string, age: number, payloadCache: [string]): Promise<any> {
        try {
            let prompting = `Hai, saya adalah ${name} saat ini saya berumur ${age}.
            buatkan saya pertanyaan yang lain selain dari pertanyaan berikut untuk pertanyaan seputar kesehatan mental saya, pertanyaan
            harus berbeda dari daftar ini:
            ${payloadCache} tapi saling berkaitan
            
            |terimakasih!`

            let result: any = await this.model.generateContent(prompting)

            const allResults: any = new Promise(async (resolve, reject) => {
                try {
                    resolve(result.response.text())
                } catch (error) {
                    reject(error.message)
                    console.error(error.message)
                }
            })

            return allResults
        } catch (error) {
            console.error(error.message)
        }
    }

    async calculationQuest(payload: any): Promise<any> {
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

            Kirim balasan dalam bentuk response JSON alih alih teks
            `

            let result: any = await this.model.generateContent(prompting)

            const allResults: any = new Promise(async (resolve, reject) => {
                try {
                    resolve(result.response.text())
                } catch (error) {
                    reject(error.message)
                    console.error(error.message)
                }
            })

            return allResults
        } catch (error) {
            console.error(error.message)
        }
    }

}
