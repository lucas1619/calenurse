import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, Unique } from "typeorm"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
import { Area } from "./area.entity";

@Entity()
export class Nurse {
    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @Column({ nullable: false })
    name: string

    @Column({ nullable: true })
    age: number

    @Column({ nullable: false, unique: true})
    email: string

    @Column({ nullable: false, default: false })
    isBoss: boolean

    @ManyToOne(() => Area, { eager: true })
    @JoinColumn({ name: 'areaId' })
    area: Area;
}