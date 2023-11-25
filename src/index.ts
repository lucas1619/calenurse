import express, { Request, Response } from "express";

// Import the connection object from ./database
import connection from "./data/db";

// Create a new Express application
const app = express();

// ...

// Define an asynchronous function to start the server and sync the database
const start = async (): Promise<void> => {
  try {
    await connection.sync(); // Synchronizes the database with the defined models
    app.listen(3000, () => { // Starts the server on port 3000
      console.log("Server started on port 3000");
    });
  } catch (error) {
    console.error(error); // Logs any errors that occur
    process.exit(1); // Exits the process with an error status code
  }
};

void start(); // Invokes the start function to start the server
