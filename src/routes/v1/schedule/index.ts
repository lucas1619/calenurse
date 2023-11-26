import { Router } from "express";
import { Request, Response } from "express";

import { myDataSource } from "../../../app-data-source";

import { DesiredShift } from "../../../entity/desired_shift.entity";
import { Between } from "typeorm";

const router = Router();

router.post("/make", async (req : Request, res : Response) => {
    try {
        const {area_id} = req.body;
        let date = new Date();
        const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
        const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);

        const desiredShiftRepository = myDataSource.getRepository(DesiredShift);
        // quiero obtener todos los turnos deseados de la semana de acuerdo al area
        const desiredShifts = await desiredShiftRepository.find({
            where: {
                date: Between(monday, sunday)
            },
            relations: ["nurse"],
            order: {
                date: "ASC"
            },
        });

        if (desiredShifts.length === 0) {
            res.status(404).json({ message: "No hay turnos deseados para el area seleccionada" });
            return
        }
        const ids = {}
        let cont = 1;
        for(let i = 0; i < desiredShifts.length; i++) {
            const desiredShift = desiredShifts[i];
            if(ids[desiredShift.nurse.id.toString()] === undefined) {
                ids[desiredShift.nurse.id.toString()] = cont;
                cont++;
            }
        }

        const sortedDesiredShifts = desiredShifts.sort((a, b) => {
            return ids[a.nurse.id.toString()] - ids[b.nurse.id.toString()];
        });

        const groupByNurse = {};

        sortedDesiredShifts.forEach((desiredShift) => {
            if(groupByNurse[desiredShift.nurse.id.toString()] === undefined) {
                groupByNurse[desiredShift.nurse.id.toString()] = [];
            }
            groupByNurse[desiredShift.nurse.id.toString()].push(desiredShift);
        });

        const excelRows = [];

        // recorrer el objeto groupByNurse
        for (const key in groupByNurse) {
            const excelRow = {}
            console.log(ids[key]);
            excelRow["Enfermera"] = ids[key];
            for (let i = 0; i < 7; i++) {
                const desiredShift = groupByNurse[key][i];
                switch (desiredShift.shift) {
                    case "day": 
                        excelRow[(i+1).toString()] = 1;
                        break;
                    case "evening":
                        excelRow[(i+1).toString()] = 2;
                        break;
                    case "night":
                        excelRow[(i+1).toString()] = 3;
                        break;
                    default:
                        excelRow[(i+1).toString()] = 0;
                        break;
                }
            }
            excelRows.push(excelRow);
        }

        res.status(200).json({ message: "success", data: excelRows });

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "error", data: error.message });
            return
        } 
        res.status(500).json({ message: "error", data: error });
    }
});





export default router;