import * as express from "express"
import { myDataSource } from "./app-data-source"

// establish database connection
myDataSource
    .initialize()
    .then((r) => {
        console.log("Data Source has been initialized!")
        return r.synchronize()
    })
    .then((r) => {
        console.log("Data Source has been synchronized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

// create and setup express app
const app = express()
app.use(express.json())

// start express server
app.listen(3000)