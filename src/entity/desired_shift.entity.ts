import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm"
import { Nurse } from "./nurse.entity"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
import { Shift } from "../types/shift.enum"

@Entity()
export class DesiredShift {
    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @OneToOne(() => Nurse, { nullable: false })
    @JoinColumn({ name: "nurseId" })    
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