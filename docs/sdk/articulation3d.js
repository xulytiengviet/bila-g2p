// Generic IPA teaching configurations. Coordinates are arbitrary scene units, not anatomical measurements.
const make=(place,manner,voiced,nasal,constriction,tongue,lip)=>({place,manner,voiced,nasal,constriction,tongue,lip});
export const phones={
m:make(['Hai môi','Bilabial'],['Mũi','Nasal'],true,true,'lips',[0,-.3,0],[0,.02]),
b:make(['Hai môi','Bilabial'],['Tắc','Stop'],true,false,'lips',[0,-.3,0],[0,.02]),
p:make(['Hai môi','Bilabial'],['Tắc','Stop'],false,false,'lips',[0,-.3,0],[0,.02]),
f:make(['Môi-răng','Labiodental'],['Xát','Fricative'],false,false,'teeth',[0,-.3,0],[.04,.12]),
v:make(['Môi-răng','Labiodental'],['Xát','Fricative'],true,false,'teeth',[0,-.3,0],[.04,.12]),
t:make(['Lợi','Alveolar'],['Tắc','Stop'],false,false,'ridge',[.62,.42,0],[.27,.25]),
d:make(['Lợi','Alveolar'],['Tắc','Stop'],true,false,'ridge',[.62,.42,0],[.27,.25]),
n:make(['Lợi','Alveolar'],['Mũi','Nasal'],true,true,'ridge',[.62,.42,0],[.27,.25]),
s:make(['Lợi','Alveolar'],['Xát','Fricative'],false,false,'ridge',[.54,.31,0],[.25,.25]),
z:make(['Lợi','Alveolar'],['Xát','Fricative'],true,false,'ridge',[.54,.31,0],[.25,.25]),
'ɲ':make(['Ngạc cứng','Palatal'],['Mũi','Nasal'],true,true,'palate',[.1,.48,0],[.25,.25]),
k:make(['Ngạc mềm','Velar'],['Tắc','Stop'],false,false,'velum',[-.58,.43,0],[.3,.24]),
'ŋ':make(['Ngạc mềm','Velar'],['Mũi','Nasal'],true,true,'velum',[-.58,.43,0],[.3,.24]),
x:make(['Ngạc mềm','Velar'],['Xát','Fricative'],false,false,'velum',[-.55,.28,0],[.3,.24]),
h:make(['Thanh môn','Glottal'],['Xát','Fricative'],false,false,'glottis',[0,-.32,0],[.38,.27]),
'ʔ':make(['Thanh môn','Glottal'],['Tắc','Stop'],false,false,'glottis',[0,-.32,0],[.38,.27]),
a:make(['Thấp','Open'],['Nguyên âm','Vowel'],true,false,null,[0,-.62,0],[.66,.3]),
i:make(['Trước cao','Close front'],['Nguyên âm','Vowel'],true,false,null,[.52,.28,0],[.23,.34]),
u:make(['Sau cao','Close back'],['Nguyên âm','Vowel'],true,false,null,[-.53,.28,0],[.19,.15]),
e:make(['Trước giữa','Mid front'],['Nguyên âm','Vowel'],true,false,null,[.36,-.06,0],[.38,.32]),
o:make(['Sau giữa','Mid back'],['Nguyên âm','Vowel'],true,false,null,[-.35,-.06,0],[.31,.19]),
'ɯ':make(['Sau cao không tròn môi','Close back unrounded'],['Nguyên âm','Vowel'],true,false,null,[-.53,.28,0],[.23,.34])
};
export const organs={
lips:{p:[2.5,.1,0],name:['Môi','Lips']},teeth:{p:[2.11,.43,0],name:['Răng','Teeth']},ridge:{p:[1.78,.68,0],name:['Lợi','Alveolar ridge']},palate:{p:[.7,.95,0],name:['Ngạc cứng','Hard palate']},velum:{p:[-.65,.69,0],name:['Ngạc mềm','Soft palate']},uvula:{p:[-1.1,.46,0],name:['Lưỡi gà','Uvula']},tongue:{p:[.5,-.6,0],name:['Lưỡi','Tongue']},nose:{p:[.3,1.63,0],name:['Khoang mũi','Nasal cavity']},pharynx:{p:[-1.25,-.55,0],name:['Hầu','Pharynx']},larynx:{p:[-1.12,-1.6,0],name:['Thanh quản','Larynx']},glottis:{p:[-1.12,-1.48,0],name:['Dây thanh / thanh môn','Vocal folds / glottis']},trachea:{p:[-1.12,-2.23,0],name:['Khí quản','Trachea']}};
export function configuration(p){if(!Object.hasOwn(phones,p))throw Error('Unknown IPA');return phones[p]}
export function airflow(p){const d=configuration(p),base=[[-1.12,-2.3,0],[-1.12,-1.52,0],[-1.25,-.65,0],[-1.05,.18,0]];if(p==='ʔ')return {points:base.slice(0,2),blocked:true,route:'blocked'};if(d.nasal)return {points:[...base,[-.8,1.25,0],[.2,1.63,0],[1.55,1.48,0],[2.5,1.35,0]],blocked:false,route:'nasal'};const blocked=d.manner[1]==='Stop';return {points:[...base,...(blocked?[organs[d.constriction].p]:[[.2,.25,0],[1.4,.19,0],[2.75,.1,0]])],blocked,route:blocked?'blocked':'oral'}}
export function project(p,yaw,pitch,scale,cx,cy){const a=yaw*Math.PI/180,b=pitch*Math.PI/180,x=p[0]*Math.cos(a)+p[2]*Math.sin(a),z=-p[0]*Math.sin(a)+p[2]*Math.cos(a),y=p[1]*Math.cos(b)-z*Math.sin(b),depth=p[1]*Math.sin(b)+z*Math.cos(b);return [cx+x*scale,cy-y*scale,depth]}
export function ellipsoid(center,radii,steps=14,rings=8){const v=(i,j)=>{const t=Math.PI*i/rings,p=2*Math.PI*j/steps;return [center[0]+radii[0]*Math.sin(t)*Math.cos(p),center[1]+radii[1]*Math.cos(t),center[2]+radii[2]*Math.sin(t)*Math.sin(p)]};const f=[];for(let i=0;i<rings;i++)for(let j=0;j<steps;j++){const a=v(i,j),b=v(i+1,j),c=v(i+1,j+1),d=v(i,j+1);f.push([a,b,c],[a,c,d])}return f}
