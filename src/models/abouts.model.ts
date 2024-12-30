import { Model, Column, Table, BelongsTo, ForeignKey } from "sequelize-typescript";
import { users } from "./users.models";

@Table({ timestamps: false })
export class abouts extends Model {
    @Column
    ID: number

    @Column
    username: string

    @Column
    description: string

    @Column
    ranking: number

    @Column
    post: string //current post user

    
    @ForeignKey(() => users)
    userID: number


    @BelongsTo(() => users)
    users: users
}