import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { VoteRead } from "../DTO/vote.query.dto";
import { CassandraService } from "src/cassandra/cassandra.service";
import { Logger } from "@nestjs/common";

@QueryHandler(VoteRead)
export class VoteReadService implements IQueryHandler<VoteRead> {
    constructor(private readonly cassandraServ: CassandraService) { }
    async execute(query: VoteRead): Promise<any> {
        const { userID, limit } = query
        try {
            Logger.debug(userID, limit)
            const getAllVoteValueFromCreatorId =
                await this.cassandraServ.getAllVoteValueFromCreatorId(userID, limit)

            return getAllVoteValueFromCreatorId
        } catch (error) {
            console.error("vote read error",
                error.message
            )
        }
    }
}