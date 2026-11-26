// SPDX-License-Identifier: MIT
// Strict, finite grammar. No actuator calls. Only simulation plans are produced.
const rules=new Map([['dừng lại','STOP'],['dừng','STOP'],['tiến một bước','STEP_FORWARD'],['lùi một bước','STEP_BACKWARD'],['quay trái','TURN_LEFT'],['quay phải','TURN_RIGHT']]);
export function compileTask(text){
 if(typeof text!=='string'||text.length>256)throw new TypeError('Invalid command');
 const source=text.normalize('NFC').trim().toLocaleLowerCase('vi').replace(/[.!?]+$/u,'').trim();
 const op=rules.get(source);
 if(!op)return {schema:'bila.task.v1',status:'rejected',reason:'unsupported-or-ambiguous',source};
 return Object.freeze({schema:'bila.task.v1',status:'simulation-only',source,op,requiresHumanConfirmation:op!=='STOP'});
}
export function simulateTask(task,state={x:0,y:0,heading:0}){
 if(!task||task.schema!=='bila.task.v1'||task.status!=='simulation-only'||compileTask(task.source).op!==task.op||!rules.has(task.source))throw new Error('Rejected task');
 if(!Number.isInteger(state.x)||!Number.isInteger(state.y)||Math.abs(state.x)>5||Math.abs(state.y)>5||![0,1,2,3].includes(state.heading))throw new Error('Invalid state');
 const next={...state};const dirs=[[0,1],[1,0],[0,-1],[-1,0]];
 if(task.op==='TURN_LEFT')next.heading=(next.heading+3)%4;
 if(task.op==='TURN_RIGHT')next.heading=(next.heading+1)%4;
 if(task.op==='STEP_FORWARD'||task.op==='STEP_BACKWARD'){const s=task.op==='STEP_FORWARD'?1:-1;next.x+=dirs[next.heading][0]*s;next.y+=dirs[next.heading][1]*s}
 if(Math.abs(next.x)>5||Math.abs(next.y)>5)throw new Error('Simulation boundary');
 return next;
}
