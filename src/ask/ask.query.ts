import { Injectable, Logger } from '@nestjs/common'
import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as dotenv from 'dotenv'
import path from 'path'
import { resolve } from 'path'
import { askCommandDTO } from './asjk.command-dto';
import { askQuery } from './ask.query-dto';
import { GeminiService } from 'src/gemini/gemini.service';
import { SystemGateway } from 'src/system/system.gateway';
import { time } from 'console';
import { askQueryResult } from './ask.query-result-dto';
import { timestamp } from 'rxjs';
dotenv.config({ path: resolve('./src/.env') });

@QueryHandler(askQueryResult)
export class AskQuery implements IQueryHandler<askQueryResult> {
    constructor(private readonly systemSocketGateway: SystemGateway,
        private readonly systemGatewaySocket: SystemGateway
    ) { }
    async execute(query: askQueryResult): Promise<any> {
        const { userID, questionTotal, createdAt } = query
        try {
            if (!userID) {
                await this.systemSocketGateway.responseIntro({ userID: userID, totaly: "maaf, ada yang tidak beres dengan layanan kami" })
            }

            await this.systemGatewaySocket.allQuestion({ userID: userID, questionTotal: questionTotal, createdAt: createdAt })
        } catch (error) {
            console.error(error.message)
            return false
        }
    }
}
