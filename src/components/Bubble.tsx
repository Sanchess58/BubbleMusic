import React,{useEffect} from 'react';
import {StyleSheet,View} from 'react-native';
import Animated,{useAnimatedStyle,useSharedValue,withRepeat,withTiming} from 'react-native-reanimated';

type Props={x:number;y:number;size:number;color:string;urgency:number;};
export default function Bubble({x,y,size,color,urgency}:Props){
  const pulse=useSharedValue(1);
  useEffect(()=>{pulse.value=withRepeat(withTiming(1.055,{duration:500}),-1,true)},[]);
  const s=useAnimatedStyle(()=>({transform:[{scale:pulse.value}]}));
  return <Animated.View style={[styles.bubble,{left:x-size,top:y-size,width:size*2,height:size*2,borderColor:color,shadowColor:color,shadowOpacity:.8,shadowRadius:18},s]}>
    <View style={[styles.core,{backgroundColor:color,opacity:.22+urgency*.22}]}/>
    <View style={[styles.ring,{borderColor:color,opacity:.18+urgency*.4,transform:[{scale:1+urgency*.18}]}]}/>
  </Animated.View>
}
const styles=StyleSheet.create({
 bubble:{position:'absolute',borderWidth:1.5,borderRadius:999,backgroundColor:'rgba(255,255,255,.07)',alignItems:'center',justifyContent:'center',shadowOffset:{width:0,height:0},elevation:10},
 core:{width:'72%',height:'72%',borderRadius:999},
 ring:{position:'absolute',width:'145%',height:'145%',borderRadius:999,borderWidth:1}
});