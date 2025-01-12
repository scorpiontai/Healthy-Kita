import { IsUUID, IsNumber } from "class-validator"
export class CommentAllPost {
    @IsUUID()
    uuidPost: string

    @IsNumber()
    limit: number

    constructor(
        uuidPost: string,
        limit: number
    ) {
        this.uuidPost = uuidPost,
        this.limit = limit
    }
}
