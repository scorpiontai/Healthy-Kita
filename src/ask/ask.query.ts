import { Injectable } from '@nestjs/common'
import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as dotenv from 'dotenv'
import path from 'path'
import { resolve } from 'path'
import { askCommandDTO } from './asjk.command-dto';
import { askQuery } from './ask.query-dto';
dotenv.config({ path: resolve('./src/.env') });


@QueryHandler(askCommandDTO)
export class AskQuery implements IQueryHandler<askQuery> {
    async execute(query: askQuery): Promise<any> {
        const { userID, question, message, timestamp } = query
    }
}
