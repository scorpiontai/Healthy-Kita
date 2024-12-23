
import { Table, Column, Model } from 'sequelize-typescript';


@Table({ timestamps: false })
export class users extends Model {
    @Column
    ID: number

    @Column
    fullName: string;

    @Column
    password: string;

    @Column
    email: string;

    @Column
    verify: number
}
