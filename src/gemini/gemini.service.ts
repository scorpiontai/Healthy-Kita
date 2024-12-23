import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'
dotenv.config({ path: resolve('./src/.env') });
import axios from 'axios';

@Injectable()
export class GeminiService {
    private key: string
    private api: string

    constructor() {
        this.api = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_AI}`
    }

    async sender(question: string): Promise<any> {
        try {
            const data = {
                contents: [
                    {
                        parts: [
                            { text: question }
                        ]
                    }
                ]
            };
            const prompt = await axios.post(this.api, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const content = prompt.data.candidates[0]?.content;
            console.debug('content', content.parts)
        } catch (err) {
            console.error(err.message);
        }
    }
}