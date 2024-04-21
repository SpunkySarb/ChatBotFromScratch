/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/
'use client';
import { writeNextLine } from "@/Actions/csvActions";
import { Input } from "antd";
import useMessage from "antd/es/message/useMessage";
import { useEffect, useState } from "react";
import classes from './QuestionsAndLabels.module.css';
import { getFromLocalStorage, saveToLocalStorage } from "@/Utils/localStorage";



/**author:Sarbjeet Singh, contact:https://www.sarbzone.com*/

import { ReadCsvFileResponse, readCsvFile, readCsvFileNames } from "@/Actions/csvActions";
import { Button, Dropdown, Empty, MenuProps, Table, TableProps, Tag } from "antd";

import classes2 from './FilesAndData.module.css';
import { CaretDownOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { exportEmbeddings } from "@/Actions/embeddingGen";


type Columns = {}


const QuestionsAndLabels:React.FC = ()=>{

    const [label, setLabel] = useState("");
    const [fileName, setFileName] = useState('output.csv');
    const [question,setQuestion] = useState("");
    const [messageAPI, contextHolder] = useMessage();

    const writer = async ()=>{
        try{

        
        const response = await writeNextLine(fileName, question, label);
        if(response==='error'){
            messageAPI.error('Data not written to file..');
        }else{
            messageAPI.success("Data written to file")
        }
        }catch(err:any){
        messageAPI.error(err.message);

        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') {

            if(question.trim()!==""){

                       

            if(label.trim()===""){
                messageAPI.error("Label Cannot Be Empty...")
            }else if (!fileName.includes('.csv')|| (fileName.length<=4)){
                messageAPI.error("Filename is not valid...")


            }else{

               writer().then(()=>{
                setQuestion("");
                setCurrentFile(fileName);
                readFile(fileName);
               }).catch(err=>{
                messageAPI.error(err.message);
               });
            }
          
        
        }
    }
      };

      const [files, setFiles] = useState<string[]>([]);
      const [currentFile, setCurrentFile] = useState("");
      const [fileData,setFileData] = useState<ReadCsvFileResponse[]>([]);
      const [isExportingEmbs, setExportingStatus] = useState(false);
      const [exportText, setExportText] = useState(<>Export Embeddings</>);
  
      const [dropdownItems, setDropDownItems] = useState<MenuProps["items"]>([]);
  
      const columns:TableProps<Columns>['columns'] = [
          {title:'Text', dataIndex:"Text", key:"text", render:(text)=><div>{text}</div>},
          {title:'Label', dataIndex:"Label", key:"label", render:(label)=><Tag style={{minWidth:100, textAlign:'center', color:'green', fontWeight:'bold'}}>{label}</Tag>}
  
      ]
  
  
      const readFile = (filename:string)=>{
  
          readCsvFile(filename).then(data=>{
  
              setFileData(data.filter(i=>"Text" in i).reverse());
  
          }).catch((err:any)=>{
              console.log(err.message);
  
          });
  
  
      }
      const exportEmbeddingsHandler = ()=>{

        
  
          if(isExportingEmbs===false){
  
         
          setExportingStatus(true);
          exportEmbeddings(currentFile,fileData.reverse()).then(status=>{
              setExportingStatus(false);
  
              if(status){
                  setExportText(<>Exported <CheckCircleOutlined /></>)
              }else{
                  setExportText(<>Error <ExclamationCircleOutlined color="red" /></>)
              }
  
              setTimeout(() => {
                  setExportText(<>Export Embeddings</>)
                  
              }, 10000);
  
          }).catch((err)=>{
  
          });
  
      }
      }
    


      useEffect(()=>{

        const lastFileName = getFromLocalStorage('fileName');
        const lastLabel = getFromLocalStorage('lastLabel');

        if(lastLabel) setLabel(lastLabel);
        if(lastFileName) setFileName(lastFileName);

        readCsvFileNames().then((files)=>{
            setFiles(files);
            setDropDownItems(files.map((i,index)=>({key:index+"",label:<Button onClick={()=>{setCurrentFile(i); setFileName(i); saveToLocalStorage('fileName',i); setLabel(""); readFile(i);}} style={{minWidth:200}}>{i}</Button>})))
            if(getFromLocalStorage('fileName')===null){
                setCurrentFile(files[0]);
                readFile(files[0]);
            }else{
                setCurrentFile(getFromLocalStorage('fileName'));
                readFile(getFromLocalStorage('fileName'));
            }
            

        }).catch((err:any)=>{
            console.log(err.message);

        });




      },[]);



return(<>

<div className={classes.container}>

{contextHolder}
 <Input value={fileName} onChange={(e)=>{setFileName(e.target.value); saveToLocalStorage('fileName',e.target.value);}} status={(!fileName.includes('.csv')||(fileName.length<=4))?"error":""} placeholder="CSV FileName"  className={classes.inputs}/>

 <Input value={label} onChange={(e)=>{setLabel(e.target.value); saveToLocalStorage('lastLabel',e.target.value);}} status={label.trim()===""?"error":""} placeholder="Write Label" className={classes.inputs}/>
 <Input value={question} onKeyDown={handleKeyPress} onChange={(e)=>{setQuestion(e.target.value)}} placeholder="Write Question or text and then press enter to save each question" className={classes.question}/>
</div>

<div>

{(files.length===0)?
     <div style={{display:'flex',justifyContent:'center', marginTop:100}}><Empty description="No files has been saved yet..." /></div>:

   

    <><div className={classes2.fileAndExportEmb}>
        <Dropdown menu={{items:dropdownItems}} >
            <Button style={{minWidth:200}}>{currentFile}<CaretDownOutlined /></Button>
            </Dropdown>
        <Button type="primary" loading={isExportingEmbs} onClick={exportEmbeddingsHandler} style={{minWidth:200, margin:10}} >{exportText}</Button>
    </div>

    <div>
    {currentFile==="" && fileData.length===0 && <div style={{display:'flex',justifyContent:'center', marginTop:100}}><Empty description="No Data written to File" /></div> }

    <div className={classes2.tableContainer}>
        <Table  columns={columns} dataSource={fileData} />
    </div>

    </div></> }
 
</div> 

</>);


}
export default QuestionsAndLabels;
