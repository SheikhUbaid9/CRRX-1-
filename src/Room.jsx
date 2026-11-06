import React, {Suspense} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls, ContactShadows} from '@react-three/drei';
function Box({at,size,color,...rest}) {return <mesh position={at} castShadow receiveShadow {...rest}><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.8}/></mesh>}
const palette=['#b16e4f','#d4ad70','#66786a','#d7c9a7','#8c5550','#76818a'];
function Plant({at,scale=1}) {return <group position={at} scale={scale}><mesh position={[0,.2,0]} castShadow><cylinderGeometry args={[.23,.17,.4,20]}/><meshStandardMaterial color="#c4a186"/></mesh>{Array.from({length:7},(_,i)=><mesh key={i} position={[Math.sin(i*2.4)*.18,.55+(i%3)*.12,Math.cos(i*2.4)*.18]} rotation={[i*.3,0,i*.5]} castShadow><sphereGeometry args={[.18,12,12]}/><meshStandardMaterial color={i%2?'#52694b':'#718365'}/></mesh>)}</group>}
function Scene({night,onShelf}) {return <>
<color attach="background" args={[night?'#292d36':'#e8e4da']}/><ambientLight intensity={night?.65:1.4}/><directionalLight position={[2,7,4]} intensity={night?.5:2.6} color={night?'#a8bbdf':'#fff2d6'} castShadow shadow-mapSize={[2048,2048]}/>
<group position={[0,-.15,0]}>
<Box at={[0,-.13,0]} size={[8,.25,6]} color="#a48260"/>{Array.from({length:16},(_,i)=><Box key={i} at={[-3.8+i*.5,.005,0]} size={[.018,.01,6]} color="#937252"/>)}
<Box at={[0,2,-3]} size={[8,4,.16]} color={night?'#747369':'#d5d0bd'}/><Box at={[-4,2,0]} size={[.16,4,6]} color="#ded8c7"/>
<Box at={[-1.5,2.35,-2.89]} size={[3.5,2.35,.08]} color="#8c7860"/>
<Box at={[-1.5,2.35,-2.82]} size={[3.28,2.12,.06]} color={night?'#34485c':'#b8cdd0'}/>
<mesh position={[-.8,2.85,-2.75]}><sphereGeometry args={[.23,24,24]}/><meshBasicMaterial color={night?'#f5e8c6':'#fff4cf'}/></mesh>
{[0,1,2].map(i=><mesh key={i} position={[-2.6+i*1.1,1.5,-2.72]}><coneGeometry args={[.75,1.15,4]}/><meshStandardMaterial color={night?'#3e5553':'#7f9a87'}/></mesh>)}
<Box at={[-1.5,2.35,-2.63]} size={[.065,2.2,.1]} color="#eee4cf"/><Box at={[-1.5,2.35,-2.63]} size={[3.35,.065,.1]} color="#eee4cf"/><Box at={[-1.5,1.2,-2.58]} size={[3.7,.12,.4]} color="#b7a17b"/>
<Box at={[-3.35,2.3,-2.58]} size={[.35,2.6,.16]} color="#e9dec5"/><Box at={[.35,2.3,-2.58]} size={[.35,2.6,.16]} color="#e9dec5"/>
<group position={[2.2,0,-2.42]} onClick={e=>{e.stopPropagation();onShelf();}} onPointerOver={()=>document.body.style.cursor='pointer'} onPointerOut={()=>document.body.style.cursor='auto'}>
{[-.94,.94].map(x=><Box key={x} at={[x,1.52,0]} size={[.12,3.04,.52]} color="#87674b"/>)}{[.16,1.05,1.95,2.94].map((y,row)=><group key={y}><Box at={[0,y,0]} size={[1.95,.1,.6]} color="#987657"/>{row<3&&Array.from({length:10},(_,i)=><Box key={i} at={[-.78+i*.17,y+.3+(i%3)*.035,.025]} size={[.12,.5+(i%3)*.07,.32]} color={palette[(i+row*2)%6]} rotation={[0,0,i===8?-.15:0]}/>)}</group>)}
</group>
<mesh position={[-.1,.035,.55]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[2,64]}/><meshStandardMaterial color="#d8cbb2"/></mesh>
{Array.from({length:6},(_,i)=><mesh key={i} position={[-.1,.04,.55]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.1+i*.13,1.115+i*.13,64]}/><meshStandardMaterial color="#b5a186"/></mesh>)}
<group position={[-1.3,0,-1.18]}><Box at={[0,1.15,0]} size={[2.7,.16,1.12]} color="#a77c52"/>{[-1.1,1.1].flatMap(x=>[-.4,.4].map(z=><Box key={`${x}${z}`} at={[x,.55,z]} size={[.1,1.1,.1]} color="#73583e"/>))}<Box at={[.55,1.27,.05]} size={[.48,.07,.34]} color="#677566"/><Box at={[.5,1.33,.05]} size={[.48,.045,.34]} color="#d5bb8b"/>
<mesh position={[-.5,1.38,.05]}><cylinderGeometry args={[.095,.085,.27,24]}/><meshStandardMaterial color="#eee6d5"/></mesh>
<group position={[-.95,1.25,-.25]}><mesh position={[0,.32,0]}><cylinderGeometry args={[.025,.025,.65]}/><meshStandardMaterial color="#5f654a"/></mesh><mesh position={[0,.65,0]}><coneGeometry args={[.28,.3,32,1,true]}/><meshStandardMaterial color="#718064" side={2}/></mesh><pointLight position={[0,.51,0]} intensity={night?9:1} color="#ffce83" distance={5}/></group></group>
<group position={[-1.4,0,.35]} rotation={[0,.2,0]}><Box at={[0,.65,0]} size={[.85,.18,.85]} color="#7d886b"/><Box at={[0,1.13,.38]} size={[.85,.9,.14]} color="#7d886b"/>{[-.33,.33].flatMap(x=>[-.3,.3].map(z=><Box key={`${x}${z}`} at={[x,.3,z]} size={[.07,.6,.07]} color="#70573d"/>))}</group>
<Plant at={[3.1,0,.75]} scale={1.7}/><Plant at={[-2.7,1.25,-2.5]} scale={.65}/>
<group position={[1.65,0,1.2]}><mesh position={[0,.56,0]} castShadow><cylinderGeometry args={[.6,.6,.1,40]}/><meshStandardMaterial color="#a7815c"/></mesh><mesh position={[0,.27,0]}><cylinderGeometry args={[.09,.2,.54,24]}/><meshStandardMaterial color="#795c43"/></mesh><Box at={[0,.65,0]} size={[.42,.08,.3]} color="#ab765a"/></group>
<Box at={[-3.87,2.4,.3]} size={[.08,1.1,.85]} color="#937658"/><Box at={[-3.81,2.4,.3]} size={[.02,.91,.67]} color="#eee4cd"/>
</group><ContactShadows frames={1} position={[0,-.25,0]} opacity={.25} scale={14} blur={2.5} far={6}/><OrbitControls makeDefault target={[0,1,0]} minDistance={6} maxDistance={14} maxPolarAngle={Math.PI/2.15} minPolarAngle={.35} enablePan={false}/>
</>}
export default function Room(props){return <Canvas frameloop="demand" shadows camera={{position:[8,6.5,10],fov:38}} dpr={[1,1.7]}><Suspense fallback={null}><Scene {...props}/></Suspense></Canvas>}
