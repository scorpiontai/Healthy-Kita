import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
@Injectable()
export class KafkaService {

    constructor(@Inject("useAskKafka") private readonly target: ClientKafka,
    ) { }


    async emitter(emit: string, message: Object): Promise<any> {
        try {
            this.target.emit(emit, message)
            Logger.debug("success emitter")

        } catch (err) {
            console.error(err.message);
        }
    }
    @EventPattern("useAsk")
    async receiver(@Payload() message: Object): Promise<any> {
        try {
            
        } catch (err) {
            console.error(err.message);
        }
    }
}
