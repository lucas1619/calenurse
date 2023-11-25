import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm"
import { Nurse } from "./nurse.entity"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
import { Shift } from "../types/shift.enum"

@Entity()
export class GeneratedShift {
    @PrimaryGeneratedColumn()
    id: UUID

    @OneToOne(() => Nurse)
    @JoinColumn()    
    nurse: Nurse

    @Column()
    date: Date

    @Column({
        type: "enum",
        enum: Shift
    })
    shift: Shift
}