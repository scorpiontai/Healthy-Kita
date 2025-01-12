import { IsUUID, IsNumber, IsString } from "class-validator"
export class CommentAllPost {
    @IsUUID()
    uuidPost: string

    @IsString()
    urlName: string

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
