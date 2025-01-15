import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { QuizGuard } from "./DTO/QuizGuard..dto";
import { BeforeInit } from "src/users/users.service";
import { users } from "src/models/users.models";
@QueryHandler(QuizGuard)
export class GuardStart implements IQueryHandler<QuizGuard> {
    constructor(private readonly BeforeInit: BeforeInit) { }
    async execute(query: QuizGuard): Promise<any> {
        let { tokenUser } = query
        tokenUser = await this.BeforeInit.decodeToken(tokenUser)

        const { userID } = tokenUser
        try {

            const find = await users.findOne({
                where: {
                    ID: userID
                },
                attributes: ['weight', 'tall', 'yearBorn', 'birthdate'],
                raw: true
            })

            if (find.weight && find.tall && find.yearBorn
                && find.birthdate) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.error("error", error.message)
        }
    }
}