import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm"
import { UUID } from "typeorm/driver/mongodb/bson.typings"
import { Area } from "./area.entity";

@Entity()
export class Nurse {
    @PrimaryGeneratedColumn()
    id: UUID

    @Column()
    name: string

    @Column()
    age: number

    @Column()
    email: string

    @Column()
    isBoss: boolean

    @ManyToOne(() => Area, { eager: true })
    @JoinColumn({ name: 'areaId' })
    area: Area;
}