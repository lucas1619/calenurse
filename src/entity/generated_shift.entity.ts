import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, Index } from "typeorm"
import { Nurse } from "./nurse.entity"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
import { Shift } from "../types/shift.enum"

@Entity()
export class GeneratedShift {
    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @OneToOne(() => Nurse)
    @JoinColumn()    
    nurse: Nurse

    @Column({ nullable: false })
    date: Date

    @Column({
        type: "enum",
        enum: Shift,
        nullable: false
    })
    shift: Shift
}