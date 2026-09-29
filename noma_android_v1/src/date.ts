export function mondayOf(date=new Date()){
  const d=new Date(date);
  d.setHours(12,0,0,0);
  const day=d.getDay();
  d.setDate(d.getDate()+(day===0?-6:1-day));
  return d;
}
export function isoDay(date:Date){
  const y=date.getFullYear();
  const m=`${date.getMonth()+1}`.padStart(2,'0');
  const d=`${date.getDate()}`.padStart(2,'0');
  return `${y}-${m}-${d}`;
}
export function fromIso(value:string){
  const [y,m,d]=value.split('-').map(Number);
  const date=new Date(y,m-1,d,12,0,0,0);
  return date;
}
export function weekDays(start=mondayOf()){
  return Array.from({length:7},(_,i)=>{
    const d=new Date(start);
    d.setDate(start.getDate()+i);
    return d;
  });
}
export function addWeeks(start:Date,delta:number){
  const d=new Date(start);
  d.setDate(d.getDate()+delta*7);
  return mondayOf(d);
}
export function weekKey(start:Date|string){
  const d=typeof start==='string'?fromIso(start):start;
  return isoDay(mondayOf(d));
}
export function formatWeekRange(start:Date){
  const days=weekDays(start);
  const a=days[0],b=days[6];
  return `${a.getDate()} ${monthShort[a.getMonth()]} – ${b.getDate()} ${monthShort[b.getMonth()]}`;
}
export const dayShort=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
export const dayLong=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
export const monthShort=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
