import test from "node:test";
import assert from "node:assert/strict";
import {
  NBR_RUNTIME_STATUS_URL, readNbrRulesRuntimeStatus, classifyNbrRuntimeIdentity,
} from "../adapters/nbrRulesRuntimeStatus";

const valid = {
  ok:true, engineVersion:"NBR-TAX-ENGINE-1.5.0",
  activeYear:"2026-27", incomeYear:"2025-26",
  ruleCount:366, runtimeBindingCount:366,
  missingRuntimeBindingCount:0, unhandledRuleCount:0,
  allRuleNodesMapped:true, sourceRegistryVersion:"FINAL_2026_09_30",
  syncFingerprint:"a".repeat(64),
};
const mock = (data:unknown, code=200) =>
  (async()=>new Response(JSON.stringify(data),{status:code})) as typeof fetch;

test("Citizen and Office read identical canonical version fingerprint without cached values",async()=>{
  const calls: Array<{url:string,options:RequestInit}> = [];
  const fetcher = (async(url:string,options:RequestInit)=>{
    calls.push({url,options});
    return new Response(JSON.stringify(valid),{status:200});
  }) as typeof fetch;
  const observation=await readNbrRulesRuntimeStatus(fetcher);
  assert.equal(NBR_RUNTIME_STATUS_URL,
    "https://gtorruuhvohafapctxym.supabase.co/functions/v1/nbr-tax-engine/status");
  assert.equal(calls[0].url,NBR_RUNTIME_STATUS_URL);
  assert.equal(calls[0].options.method,"GET");
  assert.equal(calls[0].options.cache,"no-store");
  assert.equal(observation.syncFingerprint,"a".repeat(64));
  assert.equal(classifyNbrRuntimeIdentity(observation,"2026-27","2025-26"),"matched");
  assert.equal(classifyNbrRuntimeIdentity(observation,"2027-28","2026-27"),"mismatch");
  assert.equal(classifyNbrRuntimeIdentity({...observation,ruleCount:365},"2026-27","2025-26"),"mismatch");
  // Metadata parity NEVER authorizes statutory calculation.
});

test("Citizen fails closed on contract drift and unavailable Rules SQL",async()=>{
  for(const payload of [
    {...valid,syncFingerprint:"bad"}, {...valid,ruleCount:"366"},
    {...valid,missingRuntimeBindingCount:null}, {...valid,incomeYear:"2023-24"},
    {...valid,ok:false}
  ]){
    await assert.rejects(readNbrRulesRuntimeStatus(mock(payload)),/NBR_RUNTIME_CONTRACT_MISMATCH/);
  }
  await assert.rejects(readNbrRulesRuntimeStatus(mock({},503)),/NBR_RUNTIME_UNAVAILABLE/);
});
