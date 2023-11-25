import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm"
import { Nurse } from "./nurse.entity"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
// create user entity, has one to one relationship with nurse
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: UUID

    @OneToOne(() => Nurse)
    @JoinColumn()    
    nurse: Nurse

    @Column()
    userName: string

    @Column()
    password: string
}