/* GARD DPA browser-only core. No network calls or third-party dependencies. */
(function(root){
'use strict';
const TABLES=['organizations','facilities','finances','staff_aggregates','services','outcomes','governance','evidence','reviews'];
const IDS={organizations:'org_id',facilities:'facility_id',finances:'finance_id',staff_aggregates:'staff_record_id',services:'service_record_id',outcomes:'outcome_id',governance:'governance_id',evidence:'evidence_id',reviews:'review_id'};
const LABELS={organizations:'법인',facilities:'시설',finances:'재정',staff_aggregates:'전문인력',services:'서비스',outcomes:'당사자 성과',governance:'자치·책무',evidence:'출처·증거',reviews:'검토기록'};
const STAGES={appropriation:'예산',grant_decision:'교부결정',disbursement:'지급',expense:'지출',settlement:'정산'};
function parse(id){const el=document.getElementById(id); if(!el)throw new Error('누락된 내장 데이터: '+id);return JSON.parse(el.textContent);}
function isObj(x){return x!==null && typeof x==='object' && !Array.isArray(x);}
function esc(x){return String(x===null||x===undefined?'—':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(x){return x===null||x===undefined?'미확인':typeof x==='number'?x.toLocaleString('ko-KR'):String(x);}
function pct(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&b>0?(100*a/b).toFixed(2)+'%':'판단불가';}
function dateValid(s){if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;}
function recursiveCheck(value,rule,path,schema,issues,max){
 if(issues.length>=max)return;
 if(rule.$ref){const id=rule.$ref.split('/').pop();const found=schema.$defs[id]; if(!found){issues.push({level:'error',path,message:'스키마 참조 불명 '+id});return;}return recursiveCheck(value,found,path,schema,issues,max);}
 if(Object.hasOwn(rule,'const')&&value!==rule.const)issues.push({level:'error',path,message:'고정값 불일치'});
 if(rule.enum&&!rule.enum.includes(value))issues.push({level:'error',path,message:'허용되지 않은 열거값'});
 if(rule.type){const types=Array.isArray(rule.type)?rule.type:[rule.type];const ok=types.some(t=>t==='null'?value===null:t==='array'?Array.isArray(value):t==='object'?isObj(value):t==='integer'?Number.isInteger(value):t==='number'?typeof value==='number'&&Number.isFinite(value):t==='string'?typeof value==='string':t==='boolean'?typeof value==='boolean':false);if(!ok){issues.push({level:'error',path,message:'자료형 불일치: '+types.join('|')});return;}}
 if(typeof value==='string'){if(rule.minLength!=null&&value.length<rule.minLength)issues.push({level:'error',path,message:'문자열 길이 부족'});if(rule.pattern&&!(new RegExp(rule.pattern)).test(value))issues.push({level:'error',path,message:'ID 형식 오류'});if(rule.format==='date'&&!dateValid(value))issues.push({level:'error',path,message:'날짜 형식 오류'});if(rule.format==='uri'&&value!==''){try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol))throw new Error('bad protocol');}catch(e){issues.push({level:'error',path,message:'허용되지 않은 URL'});}}}
 if(typeof value==='number'){if(rule.minimum!==undefined&&value<rule.minimum)issues.push({level:'error',path,message:'최소값 위반'});if(rule.maximum!==undefined&&value>rule.maximum)issues.push({level:'error',path,message:'최대값 위반'});}
 if(Array.isArray(value)){if(rule.uniqueItems){const s=new Set(value.map(x=>JSON.stringify(x)));if(s.size!==value.length)issues.push({level:'error',path,message:'배열 중복'});}if(rule.items)value.forEach((v,i)=>recursiveCheck(v,rule.items,path+'['+i+']',schema,issues,max));}
 if(isObj(value)){for(const k of rule.required||[]){if(!Object.hasOwn(value,k))issues.push({level:'error',path:path+'.'+k,message:'필수 필드 누락'});}if(rule.additionalProperties===false){for(const k of Object.keys(value))if(!Object.hasOwn(rule.properties||{},k))issues.push({level:'error',path:path+'.'+k,message:'허용되지 않은 필드'});}for(const [k,v] of Object.entries(value))if(rule.properties&&Object.hasOwn(rule.properties,k))recursiveCheck(v,rule.properties[k],path+'.'+k,schema,issues,max);}
}
function validate(data,schema){
 const issues=[];const push=(level,path,message)=>{if(issues.length<300)issues.push({level,path,message});};
 recursiveCheck(data,schema,'root',schema,issues,300);
 if(!isObj(data))return issues;
 const rows=t=>Array.isArray(data[t])?data[t]:[];
 const sets={};for(const t of TABLES){const id=IDS[t];const ids=new Set();for(const [i,r] of rows(t).entries()){if(!isObj(r))continue;if(ids.has(r[id]))push('error',t+'['+i+']','중복 ID '+String(r[id]));ids.add(r[id]);}sets[t]=ids;}
 for(const r of rows('facilities'))if(r.operator_org_id!=null&&!sets.organizations.has(r.operator_org_id))push('error','facilities/'+r.facility_id,'운영 법인 ID를 찾을 수 없음');
 for(const t of ['finances','staff_aggregates','services','outcomes'])for(const r of rows(t)){if(r.facility_id!=null&&!sets.facilities.has(r.facility_id))push('error',t+'/'+r[IDS[t]],'시설 ID를 찾을 수 없음');}
 for(const r of rows('finances'))if(r.recipient_org_id!=null&&!sets.organizations.has(r.recipient_org_id))push('error','finances/'+r.finance_id,'수령 법인 ID 없음');
 for(const r of rows('governance'))if(!sets.organizations.has(r.org_id))push('error','governance/'+r.governance_id,'법인 ID 없음');
 for(const t of ['organizations','facilities','finances','staff_aggregates','services','outcomes','governance'])for(const r of rows(t))for(const id of (Array.isArray(r.evidence_ids)?r.evidence_ids:[]))if(!sets.evidence.has(id))push('error',t+'/'+r[IDS[t]],'증거 ID를 찾을 수 없음: '+id);
 const flow=new Set();for(const r of rows('finances')){const k=[r.facility_id,r.fiscal_year,r.money_flow_id,r.accounting_stage].join('|');if(flow.has(k))push('error','finances/'+r.finance_id,'같은 자금흐름·회계단계 중복');flow.add(k);}
 for(const r of rows('services')){const fields=['requests_total','completed_requests','unserved_requests','cancelled_by_user','pending_requests'];if(fields.every(k=>Number.isInteger(r[k]))&&r.requests_total!==r.completed_requests+r.unserved_requests+r.cancelled_by_user+r.pending_requests)push('error','services/'+r.service_record_id,'신청 건수와 상태별 합계가 불일치');if(r.period_start>r.period_end)push('error','services/'+r.service_record_id,'기간 순서 오류');}
 for(const r of rows('outcomes')){if(Number.isFinite(r.respondents)&&Number.isFinite(r.positive_responses)&&r.positive_responses>r.respondents)push('error','outcomes/'+r.outcome_id,'긍정응답이 응답자보다 많음');if(Number.isFinite(r.respondents)&&Number.isFinite(r.eligible_cohort_count)&&r.respondents>r.eligible_cohort_count)push('error','outcomes/'+r.outcome_id,'응답자가 조사대상보다 많음');}
 for(const r of rows('governance')){if(Number.isFinite(r.ballots_cast)&&Number.isFinite(r.eligible_voters)&&r.ballots_cast>r.eligible_voters)push('error','governance/'+r.governance_id,'투표자가 의결권자보다 많음');if(Number.isFinite(r.formal_complaints_resolved)&&Number.isFinite(r.formal_complaints_received)&&r.formal_complaints_resolved>r.formal_complaints_received)push('error','governance/'+r.governance_id,'처리 민원이 접수보다 많음');}
 if(data.meta?.dataset_kind==='synthetic_demo'){for(const t of ['organizations','facilities','finances','staff_aggregates','services','outcomes','governance'])for(const r of rows(t))if(r.record_status!=='synthetic_only')push('error',t+'/'+r[IDS[t]],'합성 자료의 검증 상태 허위 전환');for(const r of rows('evidence'))if(r.source_kind!=='synthetic')push('error','evidence/'+r.evidence_id,'합성 원본을 실제 출처로 표시할 수 없음');}
 if(data.meta?.contains_personal_data===true)push('error','meta.contains_personal_data','개인정보 포함 자료는 이 앱 원장과 공개 대상에서 제외');
 if(data.meta?.publication_scope==='reviewer_approved'&&rows('evidence').some(r=>r.access_scope!=='public'))push('error','evidence','공개 파일에 비공개 증거 정보 포함');
 if(data.meta?.publication_scope==='reviewer_approved'){const raw=JSON.stringify(data);if(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(raw)||/01[016789]-?\d{3,4}-?\d{4}/.test(raw)||/\d{6}-?[1-8]\d{6}/.test(raw))push('error','public_security','개인식별 정보로 추정되는 문자열이 포함되어 공개 차단');if((data.evidence||[]).some(ev=>{try{let u=new URL(ev.url);return [...u.searchParams.keys()].some(k=>/token|api.?key|secret|signature|auth|session|password/i.test(k));}catch(e){return false;}}))push('error','public_security','공개 URL에 인증정보로 추정되는 쿼리 매개변수 발견');for(const t of ['staff_aggregates','services','outcomes','governance']){const kfields=COUNT_FIELDS[t];for(const r of rows(t))if(kfields.some(k=>typeof r[k]==='number'&&r[k]<Math.max(10,data.meta.min_public_cell_n||10)))push('error',t+'/'+r[IDS[t]],'공개 파일에 소표본 수치 노출');}}
 for(const t of ['finances','services','outcomes','governance'])for(const r of rows(t))if(r.record_status==='claim_only'||r.record_status==='missing')push('warning',t+'/'+r[IDS[t]],'미검증·근거부족 자료를 성과로 확정하지 마세요');
 return issues;
}
const COUNT_FIELDS={staff_aggregates:['sign_interpreters','deaf_interpreters','other_staff','fte'],services:['requests_total','completed_requests','unserved_requests','cancelled_by_user','pending_requests','completed_service_events','unique_users'],outcomes:['eligible_cohort_count','respondents','positive_responses'],governance:['eligible_voters','ballots_cast','formal_complaints_received','formal_complaints_resolved']};
function metrics(data,filter={}){
 const F=filter.facility&&filter.facility!=='all'?filter.facility:null;const Y=filter.year&&filter.year!=='all'?Number(filter.year):null;
 const facilities=(data.facilities||[]).filter(r=>!F||r.facility_id===F);
 const services=(data.services||[]).filter(r=>(!F||r.facility_id===F)&&(!Y||(r.period_start||'').slice(0,4)==String(Y)&&(r.period_end||'').slice(0,4)==String(Y)));
 const outcomes=(data.outcomes||[]).filter(r=>(!F||r.facility_id===F||(!F&&r.facility_id===null))&&(!Y||(r.period_start||'').slice(0,4)==String(Y)&&(r.period_end||'').slice(0,4)==String(Y)));
 const finances=(data.finances||[]).filter(r=>(!F||r.facility_id===F)&&(!Y||r.fiscal_year===Y));
 const gov=(data.governance||[]).filter(r=>!Y||r.fiscal_year===Y);
 const stageTotals={};for(const k of Object.keys(STAGES)){const xs=finances.filter(r=>r.accounting_stage===k&&Number.isInteger(r.amount_krw));stageTotals[k]={total:xs.reduce((s,r)=>s+r.amount_krw,0),count:xs.length,facilities:new Set(xs.map(x=>x.facility_id)).size};}
 const validService=services.filter(r=>Number.isInteger(r.completed_requests)&&Number.isInteger(r.unserved_requests));
 const comp=validService.reduce((s,r)=>s+r.completed_requests,0),unserved=validService.reduce((s,r)=>s+r.unserved_requests,0);
 const out=outcomes.filter(r=>Number.isInteger(r.respondents)&&Number.isInteger(r.positive_responses));
 const reviews=(data.reviews||[]); const ev=(data.evidence||[]);
 return {facilityCount:facilities.length,finance:stageTotals,services,serviceRate:validService.length&&comp+unserved>0?{num:comp,den:comp+unserved,value:comp/(comp+unserved),source:validService.map(x=>x.service_record_id)}:null,serviceCoverage:validService.length+'/'+services.length,outcomes:out,governance:gov,evidenceCount:ev.length,reviewCount:reviews.length};
}
function lineage(row,data){const ids=Array.isArray(row.evidence_ids)?row.evidence_ids:[];return ids.map(id=>(data.evidence||[]).find(r=>r.evidence_id===id)||{evidence_id:id,title:'출처 누락',verification_state:'missing'});}
function deep(v){return JSON.parse(JSON.stringify(v));}
function release(data,facIds,schema){
 const issues=validate(data,schema);if(issues.some(x=>x.level==='error'))throw new Error('원본 검증 오류 '+issues.filter(x=>x.level==='error').length+'건. 먼저 정정하세요.');
 if(data.meta.contains_personal_data)throw new Error('개인정보 포함 데이터 공개 금지');
 if(!Array.isArray(facIds)||!facIds.length)throw new Error('공개할 시설을 하나 이상 선택하세요');
 const fs=new Set(facIds);const accepted=(data.facilities||[]).filter(r=>fs.has(r.facility_id));if(!accepted.length)throw new Error('선택한 시설이 데이터셋에 없습니다');
 const publicEv=(data.evidence||[]).filter(r=>r.access_scope==='public');const evSet=new Set(publicEv.map(r=>r.evidence_id));
 const validEvidence=r=>Array.isArray(r.evidence_ids)&&r.evidence_ids.length>0&&r.evidence_ids.every(id=>evSet.has(id));
 const r0=accepted.filter(validEvidence);if(!r0.length)throw new Error('공개 가능한 증거가 연결된 시설이 없습니다. 비공개 근거로 공개 파일을 만들 수 없습니다.');const keptFs=new Set(r0.map(r=>r.facility_id));
 const filtered=t=>(data[t]||[]).filter(r=>keptFs.has(r.facility_id)&&validEvidence(r));
 const refs=new Set(r0.map(r=>r.operator_org_id).filter(Boolean));
 for(const r of filtered('finances'))if(r.recipient_org_id)refs.add(r.recipient_org_id);
 let orgs=(data.organizations||[]).filter(r=>refs.has(r.org_id)&&validEvidence(r));const orgSet=new Set(orgs.map(r=>r.org_id));
 const min=Math.max(10,data.meta.min_public_cell_n||10);const suppressed=[];
 function mask(t,rows){return rows.map(r=>{const c=deep(r);const fields=COUNT_FIELDS[t]||[];if(fields.some(k=>typeof c[k]==='number'&&c[k]<min)){for(const k of fields)c[k]=null;suppressed.push(t+'/'+r[IDS[t]]);}return c;});}
 const B={meta:{schema_version:'1.0.0',dataset_id:data.meta.dataset_id+'-PUBLIC-'+new Date().toISOString().slice(0,10),title:data.meta.title+' | 공개 승인본',as_of_date:data.meta.as_of_date,dataset_kind:data.meta.dataset_kind,publication_scope:'reviewer_approved',contains_personal_data:false,facility_reference:deep(data.meta.facility_reference),min_public_cell_n:min,method_notes:'공개승인: 소표본 전체 연동 계수 마스킹; 비공개 출처와 미승인 기관 제외. 원본의 자유서술 내부 메모는 공개하지 않음. 실제 익명성은 별도 검토 필요.'},organizations:orgs.map(r=>deep(r)),facilities:r0.map(r=>({...deep(r),operator_org_id:orgSet.has(r.operator_org_id)?r.operator_org_id:null})),finances:filtered('finances').map(r=>({...deep(r),recipient_org_id:orgSet.has(r.recipient_org_id)?r.recipient_org_id:null})),staff_aggregates:mask('staff_aggregates',filtered('staff_aggregates')),services:mask('services',filtered('services')),outcomes:mask('outcomes',(data.outcomes||[]).filter(r=>keptFs.has(r.facility_id)&&validEvidence(r))),governance:mask('governance',(data.governance||[]).filter(r=>orgSet.has(r.org_id)&&validEvidence(r))),evidence:[],reviews:[]};
 const used=new Set();for(const t of ['organizations','facilities','finances','staff_aggregates','services','outcomes','governance'])for(const r of B[t])for(const id of r.evidence_ids||[])used.add(id);
 B.evidence=publicEv.filter(r=>used.has(r.evidence_id)).map(deep);
 const checked=validate(B,schema);const errors=checked.filter(x=>x.level==='error');if(errors.length)throw new Error('공개본 검증 실패: '+errors[0].path+' / '+errors[0].message);
 return {bundle:B,report:{generated_at:new Date().toISOString(),source_dataset:data.meta.dataset_id,approved_facilities:B.facilities.length,suppressed_records:suppressed,excluded_facilities:accepted.length-B.facilities.length,publication_scope:'reviewer_approved',cautions:['공개본은 원본을 보존하지 않음','10인 미만 소표본은 동일 레코드의 연동 계수를 모두 마스킹','다른 공개 데이터와 결합해 재식별할 위험에 대한 별도 심사 필요','합성 자료는 실제 성과 아님']}};
}
function safeDownload(name,data){const blob=new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},2000);}
function openDB(){return new Promise((resolve,reject)=>{if(!('indexedDB'in root))return reject(new Error('IndexedDB 사용 불가'));const r=indexedDB.open('GARD_DPA_OWNER_V1',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('datasets'))r.result.createObjectStore('datasets');if(!r.result.objectStoreNames.contains('snapshots'))r.result.createObjectStore('snapshots',{autoIncrement:true});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function storeData(d){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction(['datasets','snapshots'],'readwrite');t.objectStore('datasets').put(deep(d),'active');t.objectStore('snapshots').add({savedAt:new Date().toISOString(),bundle:deep(d)});t.oncomplete=()=>{db.close();resolve(true);};t.onerror=()=>{db.close();reject(t.error);};});}
async function loadData(){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('datasets','readonly');const r=t.objectStore('datasets').get('active');r.onsuccess=()=>{db.close();resolve(r.result||null);};r.onerror=()=>{db.close();reject(r.error);};});}
function issueSummary(issues){const n=issues.filter(i=>i.level==='error').length,w=issues.filter(i=>i.level==='warning').length;return {errors:n,warnings:w,passed:n===0};}
function safeUrl(u){if(typeof u!=='string')return null;try{let x=new URL(u);return ['https:','http:'].includes(x.protocol)?x.href:null;}catch(e){return null;}}
root.GARD={TABLES,IDS,LABELS,STAGES,parse,esc,fmt,pct,validate,metrics,lineage,release,safeDownload,storeData,loadData,issueSummary,safeUrl,deep};
})(window);
