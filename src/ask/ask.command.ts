import { Injectable } from '@nestjs/common'
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import * as dotenv from 'dotenv'
import path from 'path'
import { resolve } from 'path'
import { askCommandDTO } from './asjk.command-dto';
dotenv.config({ path: resolve('./src/.env') });


@CommandHandler(askCommandDTO)
export class AskCommand implements ICommandHandler<askCommandDTO> {
    constructor(private readonly eventBus: EventBus) { }
    async execute(command: askCommandDTO): Promise<any> {
        const { userID, question, answer, timestamp } = command
    }
}
