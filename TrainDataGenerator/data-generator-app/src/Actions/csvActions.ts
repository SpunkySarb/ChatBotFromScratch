"use server";

import { createObjectCsvWriter } from "csv-writer"; // Importing the function to create CSV writers
import csvParser from 'csv-parser';
import fs from "fs"; // Importing the file system module
import path from "path"; // Importing the path module

// Define the directory path where output files will be stored
const directoryPath = "OUTPUT_FILES";

// Define the headers for the CSV file
const headers = [
  { id: "text", title: "Text" }, // Header for the 'text' column
  { id: "label", title: "Label" }, // Header for the 'label' column
];

// Function to create a directory asynchronously
const create_directory =  async (filePath: string):Promise<boolean> => {
 
    try{

        const directoryStatus =fs.mkdirSync(directoryPath, {recursive:true});

        const fileStatus = fs.writeFileSync(filePath, "");

        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: headers,
          });
          // Write an empty array of records to initialize the CSV file
          await csvWriter.writeRecords([]);
        
        return true;





    }catch(err:any){

        console.log(err.message+" creating error");
        return false;

    }


};

// Function to check if a file exists
const check_file_exists =  (filePath: string):boolean => {
  // Check if the file exists
  try{
   const exists = fs.accessSync(filePath, fs.constants.F_OK);
   return true;

  }catch(err:any){
    console.log(err.message);
    return false;

  }
   
   

};

// Function to write a line of data to the CSV file
export const writeNextLine = async (
  filename: string,
  text: string,
  label: string
): Promise<"success" | "error"> => {
  // Construct the full file path
  const filePath = path.join(directoryPath, filename);
  // Check if file exists, if not, create directory and file
  if(!check_file_exists(filePath)){
    await create_directory(filePath);
  };

  // Create CSV writer for appending data to existing file
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
    append: true, // Append mode to add new records to existing file
  });

  // Data to be written to the file
  const data = [{ text, label }];

  try {
    // Write the data records to the CSV file
    await csvWriter.writeRecords(data);
    return "success"; // Return success if write operation is successful
  } catch (err: any) {
    console.log(err.message);
    return "error"; // Return error if any exception occurs during write operation
  }
};



export const readCsvFileNames = async ():Promise<string[]>=>{

    try {
        
        const files = fs.readdirSync(directoryPath);
      
       return files;
      } catch (err) {
        console.error('Error reading directory:', err);
        return [];
      }


}



export type ReadCsvFileResponse = { Text: string, Label: string };

export const readCsvFile = (filename: string): Promise<ReadCsvFileResponse[]> => {
  return new Promise((resolve, reject) => {
    const directoryPath = "OUTPUT_FILES"; 

    const readableStream = fs.createReadStream(directoryPath + "/" + filename);
    const fileData: ReadCsvFileResponse[] = [];

    readableStream
      .pipe(csvParser())
      .on('data', (row: { Text: string, Label: string }) => {
        fileData.push(row);
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
        resolve(fileData);
      })
      .on('error', (error) => {
        console.error('Error parsing CSV file:', error);
        reject(error);
      });
  });
};