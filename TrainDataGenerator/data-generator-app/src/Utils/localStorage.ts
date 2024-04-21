
type Keys = 'fileName'|'lastLabel';

export const saveToLocalStorage = (key:Keys,value:string)=>{

    window.localStorage.setItem(key,value);

}


export const getFromLocalStorage=(key:Keys)=>{

    return window.localStorage.getItem(key) as string;

}