import { Injectable } from '@nestjs/common';
import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { buffer } from 'stream/consumers';

@Injectable()
export class EncService {

    async set(): Promise<any> {
        try {
            const iv = randomBytes(16);

            const key = (await promisify(scrypt)(randomUUID(), 'salt', 32)) as Buffer;

            return { key: key, iv: iv }

        } catch (err) {
            console.error(err.message);
        }
    }

    async enc(key: number[], iv: number[], textToEncrypt: any): Promise<string> {
        try {
            const keyBuffer = Buffer.from(key);
            const ivBuffer = Buffer.from(iv);

            const cipher = createCipheriv('aes-256-ctr', keyBuffer, ivBuffer);

            const encryptedText = Buffer.concat([
                cipher.update(textToEncrypt, 'utf8'),
                cipher.final(),
            ]);

            return encryptedText.toString('hex');
        } catch (err) {
            console.error('Encryption Error:', err.message);
            throw err;
        }
    }

    async dec(key: number[], iv: number[], encryptedText: string): Promise<string> {
        try {
            const keyBuffer = Buffer.from(key);
            const ivBuffer = Buffer.from(iv);

            const decipher = createDecipheriv('aes-256-ctr', keyBuffer, ivBuffer);

            const encryptedBuffer = Buffer.from(encryptedText, 'hex');

            const decryptedText = Buffer.concat([
                decipher.update(encryptedBuffer),
                decipher.final(),
            ]);

            return decryptedText.toString('utf8');
        } catch (err) {
            console.error('Decryption Error:', err.message);
            throw err;
        }
    }

}
