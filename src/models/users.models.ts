
import { Table, Column, Model } from 'sequelize-typescript';


@Table({ timestamps: false })
export class Users extends Model {
    @Column
    username: string;

    @Column
    password: number;

    @Column
    email: string;
}
