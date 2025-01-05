import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GeneralEvent } from "./general.event.dto";

@CommandHandler(GeneralEvent)
export class GeneralEventServie implements ICommandHandler<GeneralEvent> {
    async execute(command: GeneralEvent): Promise<any> {
        const { userID, general } = command

    }
}