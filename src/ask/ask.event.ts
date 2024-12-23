import { Injectable } from '@nestjs/common'
import { CommandHandler, EventsHandler, ICommandHandler, IEventHandler } from '@nestjs/cqrs';
import * as dotenv from 'dotenv'
import path from 'path'
import { resolve } from 'path'
import { askCommandDTO } from './asjk.command-dto';
import { IntroAskEvent } from './ask.event-dto';
dotenv.config({ path: resolve('./src/.env') });


@EventsHandler(IntroAskEvent)
export class IntroEvent implements IEventHandler<IntroAskEvent> {
    handle(event: IntroAskEvent) {

    }

}
