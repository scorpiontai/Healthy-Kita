import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ClientKafka, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { time } from 'console';
import { askCommandDTO } from 'src/ask/asjk.command-dto';
import { AskCommand } from 'src/ask/ask-intro.command';
import { notifEvent } from 'src/notif/DTO/notif-dt0.event';
import { TimeService } from 'src/time/time.service';
@Injectable()
export class KafkaService {

    constructor(@Inject("useAskKafka") private readonly target: ClientKafka,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly timeServ: TimeService
    ) { }
    async emitter(emit: string, message: Object): Promise<any> {
        try {
            this.target.emit(emit, message)
            Logger.debug("success emitter")

        } catch (err) {
            console.error(err.message);
        }
    }
}
