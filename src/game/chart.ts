export type BubbleType = 'tap' | 'hold' | 'chain' | 'burst';
export type ChartEvent = {
  time:number; type:BubbleType; x:number; y:number; size:number;
  color:string; life:number; duration?:number; chainId?:string;
};

const colors=['#4EE7FF','#8B6CFF','#FF4FC3','#FFB84E'];
export const chart:ChartEvent[] = [];

for(let i=0;i<110;i++){
  const t=1+i*.5;
  chart.push({
    time:t,
    type:i%16===0?'burst':i%12===6?'hold':'tap',
    x:.5+Math.sin(i*.83)*.34,
    y:.5+Math.cos(i*.61)*.34,
    size:i%16===0?.085:i%12===6?.07:.045,
    color:colors[i%3],
    life:i%12===6?1.9:1.08,
    duration:i%12===6?1.7:undefined
  });
}
[[8,.18,.32],[14,.32,.65],[22,.72,.3],[30,.25,.7],[40,.78,.62],[48,.22,.28]].forEach((a,k)=>{
  for(let j=0;j<4;j++) chart.push({
    time:a[0]+j*.18,type:'chain',x:a[1]+j*.12,y:a[2]+j*.09,size:.036,
    color:colors[(k+1)%3],life:.72,chainId:'c'+k
  });
});
[18,36,54].forEach((t,k)=>{
  for(let j=0;j<7;j++){
    const a=j/7*Math.PI*2;
    chart.push({time:t+j*.11,type:'burst',x:.5+Math.cos(a)*.38,y:.5+Math.sin(a)*.36,
      size:.047,color:colors[(j+k)%4],life:.78,chainId:'b'+k});
  }
});
chart.sort((a,b)=>a.time-b.time);