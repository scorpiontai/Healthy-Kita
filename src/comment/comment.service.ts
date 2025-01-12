import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CommentarUsers } from './DTO/comment.dto';

@CommandHandler(CommentarUsers)
export class CommentService implements ICommandHandler<CommentarUsers> {
    constructor(private readonly eventBus: EventBus) { }
    async execute(command: CommentarUsers): Promise<any> {
        try {
            const { uuidPost, content, userID } = command

            //validation
            if (uuidPost.length < 8 && content.length === 0 && userID === 0) {
                return false
            }

            await this.eventBus.publish(new CommentarUsers(uuidPost, content, userID))
            return true

        } catch (error) {
            console.error("comment handler error", error.message)
            return false
        }
    }
}
