'use server';

import { ReadCsvFileResponse } from "./csvActions";
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import path from 'path';
import fs from 'fs';
const root = path.resolve(__dirname);

tf.setBackend('cpu');


const output_directory = "EMBEDDING_OUTPUT";

type EmbeddingFileType = {Text:string,Embedding:number[], Label:string}

export const exportEmbeddings = async (filename:string, data:ReadCsvFileResponse[])=>{

    try{

        if (!fs.existsSync(output_directory)) {
            fs.mkdirSync(output_directory, { recursive: true });
        }

        console.log(data);
        

        const USE_MODEL = await use.load();

    const EmbeddingData:EmbeddingFileType[] = await Promise.all(data.filter(i=>"Text" in i).map(async (i,index)=>{
        
        

        const embeddingTensor = await USE_MODEL.embed(i.Text);
        const embeddingArray = await embeddingTensor.array();
        const Embedding = embeddingArray[0];

        return {Text:i.Text,Label:i.Label,Embedding};

    }));

   
        fs.writeFileSync(output_directory+"/"+filename.replace(".csv","")+".json", JSON.stringify(EmbeddingData));
    

    
    
    return true;


}catch(err:any){
    console.log(err.message);
    return false;

}


}
