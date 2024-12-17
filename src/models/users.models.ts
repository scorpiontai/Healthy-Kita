
import { Table, Column, Model } from 'sequelize-typescript';


@Table({ timestamps: false })
export class users extends Model {
    @Column
    username: string;

    @Column
    password: string;

    @Column
    email: string;
}
