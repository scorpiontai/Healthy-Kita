
import { Table, Column, Model } from 'sequelize-typescript';


@Table({ timestamps: false })
export class Users extends Model {
    @Column
    name: string;

    @Column
    age: number;

    @Column
    breed: string;
}
