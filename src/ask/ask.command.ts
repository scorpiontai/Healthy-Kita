import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import path from 'path'
import { resolve } from 'path'
dotenv.config({ path: resolve('./src/.env') });
@Injectable()
export class AskCommand {

}
