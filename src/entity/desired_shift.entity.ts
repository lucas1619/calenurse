import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm"
import { Nurse } from "./nurse.entity"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
import { Shift } from "../types/shift.enum"

@Entity()
export class DesiredShift {
    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @ManyToOne(() => Nurse)
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