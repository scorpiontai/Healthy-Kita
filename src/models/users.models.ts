
import { Table, Column, Model, HasMany, HasOne } from 'sequelize-typescript';
import { abouts } from './abouts.model';
import { Col } from 'sequelize/types/utils'

@Table({ timestamps: false })
export class users extends Model {
    @Column
    ID: number

    @Column
    fullName: string;

    @Column
    username: string

    @Column
    password: string;

    @Column
    email: string;

    @Column
    verify: number

    @Column
    birthdate: Date

    @Column
    yearBorn: number

    @Column
    pictures: string

    @Column
    intensActivityWeek: string

    @Column
    encInfo: number

    @Column
    gender: boolean

    @Column
    weight: number

    @Column
    oauth: boolean

    @Column
    tall: number

    @HasOne(() => abouts)
    abouts: abouts

}

