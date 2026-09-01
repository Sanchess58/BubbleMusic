export type Quality='PERFECT'|'GREAT'|'GOOD';
export function timingMultiplier(q:Quality){return q==='PERFECT'?1.5:q==='GREAT'?1.15:.8}
export function baseValue(type:string){
  return type==='burst'?350:type==='hold'?260:type==='chain'?90:100;
}
export function comboMultiplier(combo:number,flow:number){
  return 1+Math.min(combo,60)/30+flow/100;
}
export function quality(age:number,life:number):Quality{
  const d=Math.abs(age-life*.48);
  return d<.11?'PERFECT':d<.24?'GREAT':'GOOD';
}