export function mondayOf(date=new Date()){
  const d=new Date(date); d.setHours(12,0,0,0); const day=d.getDay();
  d.setDate(d.getDate()+(day===0?-6:1-day)); return d;
}
export function isoDay(date:Date){
  const y=date.getFullYear(),m=`${date.getMonth()+1}`.padStart(2,'0'),d=`${date.getDate()}`.padStart(2,'0');
  return `${y}-${m}-${d}`;
}
export function weekDays(start=mondayOf()){
  return Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
}
export const dayShort=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
export const monthShort=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
