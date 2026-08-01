export type Media={id:string,file:string,thumb:string,type:"image"|"video"|"document",title:string,date:string,tags:string[],favorite?:boolean,width?:number,height?:number};
export type Album={year:string,category:string,slug:string,title:string,description:string,cover?:string,published:boolean,order:number,media:Media[]};
