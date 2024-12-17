import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
@Injectable()
export class RandomcodeService {

    async generateRandom(): Promise<any> {
        try {
            return randomUUID()
        } catch (err) {
            console.error(err.message);
        }
    }
}
