import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { resolve } from 'path'
dotenv.config({ path: resolve('./src/.env') });
@Injectable()
export class NodemailerService {
    private transporter: nodemailer.Transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            ignoreTLS: false,
            secure: false,
            auth: {
                user: process.env.MAIL_HOST,
                pass: process.env.MAIL_PW,
            },
        });
    }
    async sendMessage(target: string, subject: string, text: string, html?: string): Promise<any> {
        try {
            const info = await this.transporter.sendMail({
                from: `Lingkungan Kita" <${process.env.MAIL_HOST}>`,
                to: target,
                subject: subject,
                text: text,
                html: html
            });
        } catch (err) {
            console.error(err.message);
        }
    }
}
