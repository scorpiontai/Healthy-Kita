import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PublishPrepare } from "../DTO/publish.share";
import { AischemaService } from "src/mongoose/aischema/aischema.service";
import { Logger } from "@nestjs/common";

@QueryHandler(PublishPrepare)
export class getExternalInfoService implements IQueryHandler<PublishPrepare> {
    constructor(
        private readonly PostService: AischemaService
    ) { }
    async execute(query: PublishPrepare): Promise<any> {
        let { userID } = query
        const { ID, limit } = userID
        try {
            const find = await this.PostService.findAllByUUID(ID, limit)
            return find
        } catch (error) {
            console.error("error get all external", error.message)
        }
    }
}