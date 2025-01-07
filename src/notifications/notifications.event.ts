import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationsEvent } from "./notifications.event.dto";
import { SystemGateway } from "src/system/system.gateway";

@EventsHandler(NotificationsEvent)
export class NotificationsService implements IEventHandler<NotificationsEvent> {
    constructor(
        private readonly systemGatewaySocket: SystemGateway
    ) { }
    async handle(event: NotificationsEvent): Promise<any> {
        const { userID, message, time } = event

        await this.systemGatewaySocket.notifReceivMessage(userID, {
            message: message,
            time: time
        })
    }
}