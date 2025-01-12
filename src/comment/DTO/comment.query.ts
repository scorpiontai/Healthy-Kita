import { IsNumber, IsUUID } from "class-validator"
export class CommentQuery {
    @IsUUID()
    uuidComment: string

    @IsUUID()
    uuidPost: string

    @IsNumber()
    userID: number


    constructor(
        uuidComment: string, uuidPost: string, userID: number
    ) {
        this.uuidComment = uuidComment,
            this.uuidPost = uuidPost,
            this.userID = userID
    }
}
