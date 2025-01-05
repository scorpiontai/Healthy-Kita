import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { auditError } from "./audit-error.dto";
import { AischemaService } from "../mongoose/aischema/aischema.service";
import { Logger } from "@nestjs/common";

@EventsHandler(auditError)
export class AuditError implements IEventHandler<auditError> {
    constructor(private readonly AISchemaServ: AischemaService) { }
    async handle(event: auditError) {
        try {
            const { userID, message } = event

            //this action
            /*
         const shutDown = await this.AISchemaServ.shutDown(userID)
            Logger.debug("shut down bro")
            if (!shutDown) {
                shutDown
            }
                */

        } catch (error) {
            console.error(error.message)
        }
    }
}