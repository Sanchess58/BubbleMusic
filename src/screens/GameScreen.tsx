import React,{useEffect,useRef,useState} from 'react';
import {Dimensions,StyleSheet,Text,View,Pressable} from 'react-native';
import {Gesture,GestureDetector} from 'react-native-gesture-handler';
import Bubble from '../components/Bubble';
import {chart,ChartEvent} from '../game/chart';
import {baseValue,comboMultiplier,quality,Quality,timingMultiplier} from '../game/score';

const W=Dimensions.get('window').width,H=Dimensions.get('window').height;
const FIELD_H=H-120;

type Live=ChartEvent&{id:number;born:number;dead?:boolean};
type Props={started:boolean;onStart:()=>void};

export default function GameScreen({started,onStart}:Props){
 const [elapsed,setElapsed]=useState(0),[score,setScore]=useState(0),[combo,setCombo]=useState(0),[flow,setFlow]=useState(0);
 const [bubbles,setBubbles]=useState<Live[]>([]),[feedback,setFeedback]=useState('');
 const index=useRef(0),id=useRef(0),last=useRef(0),running=useRef(false);
 const active=useRef<Live[]>([]);
 const audio=useRef<AudioContext|null>(null);

 useEffect(()=>{if(!started)return; running.current=true; last.current=Date.now(); const loop=()=>{
   if(!running.current)return;
   const now=Date.now(),dt=Math.min(.05,(now-last.current)/1000);last.current=now;
   setElapsed(e=>e+dt);
   const e=elapsed+dt;
   while(index.current<chart.length&&chart[index.current].time<=e){
     const c=chart[index.current++]; active.current.push({...c,id:id.current++,born:e});
   }
   active.current=active.current.filter(b=>!b.dead&&e-b.born<b.life);
   setBubbles([...active.current]);
   setFlow(f=>Math.max(0,f-dt*2.2));
   if(e>=60){running.current=false}
   requestAnimationFrame(loop);
 }; requestAnimationFrame(loop); return()=>{running.current=false}},[started]);

 const pop=(b:Live,q:Quality)=>{
   if(b.dead)return;
   b.dead=true;
   const pts=Math.round(baseValue(b.type)*timingMultiplier(q)*comboMultiplier(combo,flow));
   setScore(s=>s+pts);setCombo(c=>c+1);setFlow(f=>Math.min(100,f+(q==='PERFECT'?5:q==='GREAT'?3:2)));
   setFeedback(q);
   setTimeout(()=>setFeedback(''),500);
   setBubbles([...active.current]);
 };

 const miss=(b:Live)=>{
   if(b.dead)return;
   b.dead=true;setCombo(0);setFlow(f=>Math.max(0,f-18));setFeedback('MISS');setTimeout(()=>setFeedback(''),500);
 };

 const hit=(px:number,py:number)=>{
   let best:Live|undefined,dist=999;
   for(const b of active.current){
     if(b.dead)continue;
     const x=b.x*W,y=b.y*FIELD_H,d=Math.hypot(px-x,py-y),r=b.size*W*1.7;
     if(d<r&&d<dist){best=b;dist=d}
   }
   if(!best)return;
   const age=elapsed-best.born;
   if(best.type==='hold') return; // handled by long press
   pop(best,quality(age,best.life));
 };

 const pan=Gesture.Pan().onEnd(e=>{
   const d=Math.hypot(e.translationX,e.translationY);
   if(d<18) hit(e.x,e.y);
   else {
     const steps=Math.max(3,Math.ceil(d/35));
     for(let i=0;i<=steps;i++) hit(e.x-e.translationX+e.translationX*i/steps,e.y-e.translationY+e.translationY*i/steps);
   }
 }).runOnJS(true);

 const long=Gesture.LongPress().minDuration(650).onEnd(e=>{
   let best:Live|undefined,dist=999;
   for(const b of active.current){
     if(b.dead||b.type!=='hold')continue;
     const d=Math.hypot(e.x-b.x*W,e.y-b.y*FIELD_H);
     if(d<b.size*W*1.8&&d<dist){best=b;dist=d}
   }
   if(best)pop(best,'PERFECT');
 }).runOnJS(true);

 const gesture=Gesture.Exclusive(long,pan);

 return <View style={styles.root}>
   <View style={styles.hud}>
    <View><Text style={styles.label}>SCORE</Text><Text style={styles.value}>{score.toLocaleString()}</Text></View>
    <View style={styles.center}><Text style={styles.label}>COMBO</Text><Text style={styles.combo}>×{combo}</Text></View>
    <View style={styles.right}><Text style={styles.label}>FLOW</Text><Text style={styles.value}>{Math.round(flow)}%</Text></View>
   </View>
   <View style={styles.flow}><View style={[styles.flowIn,{width:`${flow}%`}]}/></View>
   <GestureDetector gesture={gesture}>
    <View style={styles.field}>
      {bubbles.map(b=><Bubble key={b.id} x={b.x*W} y={b.y*FIELD_H} size={b.size*W} color={b.color} urgency={Math.min(1,Math.max(0,(elapsed-b.born)/b.life-.25)/.6)}/>)}
      {!!feedback&&<Text style={[styles.feedback,{color:feedback==='MISS'?'#ff5577':'#fff'}]}>{feedback}</Text>}
    </View>
   </GestureDetector>
   <View style={styles.bottom}><Text style={styles.track}>BUBBLE MUSIC — WIP DEMO</Text><Text style={styles.time}>{Math.floor(elapsed/60)}:{String(Math.floor(elapsed)%60).padStart(2,'0')} / 1:00</Text></View>
   {!started&&<View style={styles.overlay}><View style={styles.card}><Text style={styles.logo}>BUBBLE</Text><Text style={styles.sub}>• MUSIC •</Text><Text style={styles.info}>Лопай пузыри в ритм. TAP, SWIPE и HOLD. Сохраняй COMBO и FLOW.</Text><Pressable style={styles.button} onPress={onStart}><Text style={styles.buttonText}>НАЧАТЬ ИГРУ</Text></Pressable></View></View>}
 </View>
}
const styles=StyleSheet.create({
 root:{flex:1,backgroundColor:'#050612'},hud:{height:76,paddingHorizontal:18,paddingTop:14,flexDirection:'row',justifyContent:'space-between'},center:{alignItems:'center'},right:{alignItems:'flex-end'},label:{fontSize:9,letterSpacing:2,color:'rgba(255,255,255,.5)',fontWeight:'700'},value:{fontSize:22,color:'#fff',fontWeight:'900'},combo:{fontSize:29,color:'#fff',fontWeight:'900'},flow:{height:4,marginHorizontal:18,backgroundColor:'rgba(255,255,255,.1)',borderRadius:5,overflow:'hidden'},flowIn:{height:'100%',backgroundColor:'#8b6cff'},field:{flex:1,position:'relative'},feedback:{position:'absolute',alignSelf:'center',top:'46%',fontSize:24,fontWeight:'900',letterSpacing:2},bottom:{height:40,paddingHorizontal:18,justifyContent:'center'},track:{fontSize:11,fontWeight:'700',color:'rgba(255,255,255,.8)'},time:{fontSize:10,color:'rgba(255,255,255,.35)'},overlay:{...StyleSheet.absoluteFillObject,backgroundColor:'#050612',alignItems:'center',justifyContent:'center'},card:{width:'88%',padding:28,borderRadius:28,borderWidth:1,borderColor:'rgba(255,255,255,.13)',backgroundColor:'rgba(10,10,28,.96)',alignItems:'center'},logo:{fontSize:42,fontWeight:'900',letterSpacing:-2,color:'#8b6cff'},sub:{fontSize:11,letterSpacing:4,color:'rgba(255,255,255,.45)',marginTop:4},info:{fontSize:13,lineHeight:21,textAlign:'center',color:'rgba(255,255,255,.68)',marginVertical:25},button:{backgroundColor:'#665cff',paddingHorizontal:26,paddingVertical:14,borderRadius:15},buttonText:{fontWeight:'900',color:'#fff',fontSize:14}
});