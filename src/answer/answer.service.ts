import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerCommand } from './DTO/answer-command.dto';
import { EncService } from 'src/enc/enc.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CouchbBaseService } from 'src/couchbase/couchbase.service';

@CommandHandler(AnswerCommand)
export class AnswerService implements ICommandHandler<AnswerCommand> {
    constructor(private readonly eventEmitter: EventEmitter2,
        private readonly encServ: EncService,
        private readonly couchbaseServ: CouchbBaseService
    ) { }
    async execute(command: AnswerCommand): Promise<any> {
        let { userID, range, encKey, ivKey } = command
        try {
            let userIDEnc = await this.encServ.enc(encKey, ivKey, userID.toString())

            const payload = {
                userIDEnc: userIDEnc,
                range: range
            }

            let validation = await this.couchbaseServ.get(`AI`, `question:${userIDEnc}`)
            validation = validation.content

            //need action
            if (validation) {
                const action =
                    range.length >= 5 ?
                        this.eventEmitter.emit("submitted",
                            payload)
                        : false

                return { status: action }
            } else {
                return { status: false }
            }


        } catch (error) {

        }
    }
}
