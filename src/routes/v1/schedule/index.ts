import { Router } from "express";
import { Request, Response } from "express";
import { myDataSource } from "../../../app-data-source";
import { DesiredShift } from "../../../entity/desired_shift.entity";
import { Between } from "typeorm";
import Excel from 'exceljs';
import * as path from 'path';
import {PythonShell} from 'python-shell';
import { config } from 'dotenv';
import fs from 'fs';
import { Shift } from "../../../types/shift.enum";
import { Nurse } from "../../../entity";
import { GeneratedShift } from "../../../entity";


config();
const router = Router();

function obtenerFechasSemana(): Date[] {
    const fechasSemana = [];
    let date = new Date();
    if (date.getDay() === 0) {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 6);
    }
    for (let i = 1; i <= 7; i++) {
      fechasSemana.push(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + i));
    }
  
    return fechasSemana;
  }

router.post("/make", async (req : Request, res : Response) => {
    try {
        const {day, evening, night} = req.body;
        let date = new Date();
        if (date.getDay() === 0) {
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 6);
        }
        const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1);
        const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7);

        const desiredShiftRepository = myDataSource.getRepository(DesiredShift);
        const nurseRepository = myDataSource.getRepository(Nurse);
        const generatedShiftRepository = myDataSource.getRepository(GeneratedShift);
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

        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Turnos');
        const worksheet2 = workbook.addWorksheet('EnfermerasPorTurno');
        const worksheet3 = workbook.addWorksheet('DiasLibres');
        const worksheetColumns = [
            { header: 'Enfermera', key: 'Enfermera', width: 10 },
            { header: '1', key: '1'},
            { header: '2', key: '2'},
            { header: '3', key: '3'},
            { header: '4', key: '4'},
            { header: '5', key: '5'},
            { header: '6', key: '6'},
            { header: '7', key: '7'},
        ];
        const worksheetColumns2 = [
            { header: 'Mañana', key: 'day'},
            { header: 'Tarde', key: 'evening'},
            { header: 'Noche', key: 'night'},
        ];
        const worksheetColumns3 = [
            { header: 'Enfermera', key: 'Enfermera', width: 10 },
            {header: 'Dia Libre', key: 'day'}
        ]
        
        // from excelRows get the nurses and the days they want to be free (0)
        const excelRows3 = [];
        for (const key in groupByNurse) {
            const excelRow = {}
            excelRow["Enfermera"] = ids[key];
            for (let i = 0; i < 7; i++) {
                const desiredShift = groupByNurse[key][i];
                if(desiredShift.shift === "free") {
                    excelRow["day"] = i+1;
                }
            }
            excelRows3.push(excelRow);
        }


        worksheet.columns = worksheetColumns;
        worksheet2.columns = worksheetColumns2;
        worksheet3.columns = worksheetColumns3;

        worksheet.addRows(excelRows);
        worksheet2.addRow({day, evening, night});
        worksheet3.addRows(excelRows3);

        const exportPath = path.resolve(__dirname,  `nurses-${new Date().getTime().toString()}.xlsx`);
        await workbook.xlsx.writeFile(exportPath);
        console.log("file exported", exportPath);
        const messages = await PythonShell.run(`${process.env.IA_LOCATION}`, {
            args: [exportPath]
        })
        console.log(messages);
        const schedule = JSON.parse(messages[0]);

        fs.unlinkSync(exportPath);                     
        
        const fechasSemana = obtenerFechasSemana();
        const reverseIds = {};
        for(const key in ids) {
            reverseIds[ids[key]] = key;
        }
        for(const day in schedule) {
            const date = fechasSemana[parseInt(day) - 1];
            for(const shift in schedule[day]) {
                let shiftDate = Shift.FREE;
                switch (shift) {
                    case "1":
                        shiftDate = Shift.DAY;
                        break;
                    case "2":
                        shiftDate = Shift.EVENING;
                        break;
                    case "3":
                        shiftDate = Shift.NIGHT;
                        break;
                    default:
                        shiftDate = Shift.FREE;
                        break;
                }
                for(let i = 0; i < schedule[day][shift].length; i++) {
                    const nurseId = reverseIds[schedule[day][shift][i]];
                    const generatedShift = new GeneratedShift();
                    generatedShift.nurse = await nurseRepository.findOneById(nurseId);
                    generatedShift.date = date;
                    generatedShift.shift = shiftDate;
                    await generatedShiftRepository.save(generatedShift);
                }
            }
        }
        

        res.status(200).json({ message: "success", data: "Se genero el horario correctamente" });                                                      

    } catch (error) {                                                       
        if (error instanceof Error) {
            res.status(500).json({ message: "error", data: error.message });
            return
        } 
        res.status(500).json({ message: "error", data: error });
    }
});


router.get("/generate", async (req : Request, res : Response) => {
    const identificadores = [
        'e5ee3668-07bd-411b-8f75-5d4bb430adc4',
        '79223ce6-d248-4cdd-9066-a0c1017c4a93',
        'ecab6aea-beeb-4a58-917f-c58f6d7f919a',
        '15d92ab7-42a1-4f92-a2d8-570c49518e11',
        'a091ea9e-e3a1-4d76-b094-774d7d5d238f',
        '1599b1fb-0e5e-4a56-9c20-7092fead6555',
        '088db866-a331-4123-a39c-2b946e754e64',
        '9dbbded0-0429-49fd-bf6c-4f2c97706a16',
        '6e9b3d4b-317a-413f-a9e4-75babefb263f',
        'c1d3d857-d974-481b-a622-743bf914a077',
        '048f9710-63cf-4ea2-b9ed-07f309c9893a',
        'd72e04ce-3c53-4551-a4df-5e33457cc4ea',
        '04f71f0b-1866-4302-99b4-196054e3255f',
        '92ba5567-c7d6-452c-982e-90290d981ab6',
        '3903fc46-03f5-442e-a903-b683c24abed2',
        '021d4f3e-389b-412a-8125-5c4ac956acca',
        '16668c34-eb02-4fee-b5ae-cb6279cb93ee',
        '474a4931-ee09-4889-b99b-7448172262b1',
        '2db7a6f7-4618-4206-afd2-0a90e42627e8'
    ];
    const matrizEnfermeras = [
        [ 1, 3, 3, 3, 1, 0, 3, 2 ],
        [ 2, 1, 1, 1, 1, 3, 3, 0 ],
        [ 3, 3, 1, 2, 0, 3, 2, 2 ],
        [ 4, 3, 1, 0, 1, 1, 2, 2 ],
        [ 5, 0, 3, 1, 3, 1, 3, 3 ],
        [ 6, 2, 1, 1, 1, 3, 0, 1 ],
        [ 7, 3, 2, 1, 0, 2, 3, 3 ],
        [ 8, 1, 0, 2, 1, 3, 1, 1 ],
        [ 9, 3, 3, 1, 1, 2, 0, 2 ],
        [ 10, 3, 1, 2, 2, 2, 3, 0 ],
        [ 11, 3, 1, 3, 1, 0, 1, 1 ],
        [ 12, 1, 1, 1, 3, 0, 2, 1 ],
        [ 13, 2, 3, 0, 2, 2, 2, 1 ],
        [ 14, 1, 1, 0, 1, 1, 3, 3 ],
        [ 15, 2, 1, 1, 0, 1, 1, 3 ],
        [ 16, 0, 2, 1, 2, 1, 3, 3 ],
        [ 17, 1, 1, 0, 1, 3, 1, 3 ],
        [ 18, 2, 3, 1, 1, 1, 0, 3 ],
        [ 19, 3, 1, 2, 2, 2, 0, 3 ]
    ];
    const fechasSemana = obtenerFechasSemana();

    for (const fecha of fechasSemana) {
        console.log(fecha.toISOString().split('T')[0]);
    }

    const desiredShiftRepository = myDataSource.getRepository(DesiredShift);
    const nurseRepository = myDataSource.getRepository(Nurse);
    for (let i = 0; i < matrizEnfermeras.length; i++) {
        const enfermeraId = identificadores[matrizEnfermeras[i][0] - 1];
        for (let j = 1; j < matrizEnfermeras[i].length; j++) {
            const desiredShift = new DesiredShift();
            desiredShift.nurse = await nurseRepository.findOneById(enfermeraId);
            desiredShift.date = fechasSemana[j-1];
            switch (matrizEnfermeras[i][j]) {
                case 1:
                    desiredShift.shift = Shift.DAY;
                    break;
                case 2:
                    desiredShift.shift = Shift.EVENING;
                    break;
                case 3:
                    desiredShift.shift = Shift.NIGHT;
                    break;
                default:
                    desiredShift.shift = Shift.FREE;
                    break;
            }
            await desiredShiftRepository.save(desiredShift);
        }
    }
    res.json({message: "success"});
      
});





export default router;