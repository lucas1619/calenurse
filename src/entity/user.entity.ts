import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm"
import { Nurse } from "./nurse.entity"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
// create user entity, has one to one relationship with nurse
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @OneToOne(() => Nurse)
    @JoinColumn()    
    nurse: Nurse

    @Column()
    username: string

    @Column()
    password: string
}