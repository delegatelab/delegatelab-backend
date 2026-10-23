import * as sdk from '@stellar/stellar-sdk';
import {buildCorpus,assess} from '../delegatelab-engine/index.mjs';
export const TESTNET=sdk.Networks.TESTNET;
export function contractError(events,accountId){for(const e of events??[]){const ev=e.event;if(!ev?.contractId||sdk.StrKey.encodeContract(ev.contractId.toXdr())!==accountId)continue;for(const topic of ev.body?.value?.topics??[]){if(topic.type==='scvError'&&topic.value.type==='sceContract')return topic.value.value;}}return null;}
export function classifySimulation(sim,accountId,expectedCode){if(!sdk.rpc.Api.isSimulationError(sim))return {outcome:'accept',evidence:'Enforced testnet simulation accepted signed delegated authorization'};const code=contractError(sim.events,accountId);if(code===expectedCode)return {outcome:'reject',evidence:'Enforced simulation: fixture account returned contract error '+code};return {outcome:'error',evidence:('Unclassified simulation failure: '+sim.error).slice(0,9000)};}
export async function pinNetwork(server,deployment){const n=await server.getNetwork();if(n.passphrase!==TESTNET||deployment.networkPassphrase!==TESTNET)throw new Error('Testnet network identity required');for(const c of Object.values(deployment.contracts)){const instance=await server.getContractInstance(c.id);if(instance.executable?.wasmHash?.toString()!==c.wasmHash)throw new Error('Pinned executable mismatch: '+c.id);}return n;}
export async function runSignedSuite(deployment,key,{server=new sdk.rpc.Server(deployment.rpcUrl,{timeout:20000})}={}){
 if(key.publicKey()!==deployment.sourceAccount)throw new Error('Dedicated testnet fixture signer mismatch');await pinNetwork(server,deployment);
 const runs=[];
 for(const kind of ['strict','vulnerable']){
  const policy={account:deployment.contracts[kind].id,delegate:key.publicKey(),target:deployment.contracts.sink.id,recipient:key.publicKey(),alternateTarget:deployment.contracts.alternateSink.id,alternateRecipient:deployment.contracts.sink.id,function:'consume',cap:'100'};
  const corpus=buildCorpus(policy),observations=[],transcripts=[];
  for(const c of corpus.cases){try{
   const src=await server.getAccount(deployment.sourceAccount);const args=[new sdk.Address(c.intent.account).toScVal(),new sdk.Address(c.intent.recipient).toScVal(),sdk.nativeToScVal(BigInt(c.intent.amount),{type:'i128'})];
   const build=auth=>new sdk.TransactionBuilder(new sdk.Account(src.accountId(),src.sequenceNumber()),{fee:'10000',networkPassphrase:TESTNET}).addOperation(sdk.Operation.invokeContractFunction({contract:c.intent.target,function:'consume',args,...(auth?{auth}: {})})).setTimeout(120).build();
   const recorded=await server.simulateTransaction(build(),undefined,'record');if(sdk.rpc.Api.isSimulationError(recorded)||recorded.result.auth.length!==1)throw new Error('Recording did not yield exactly one auth entry');
   const expiry=recorded.latestLedger+100;const entry=sdk.buildWithDelegatesEntry({entry:recorded.result.auth[0],validUntilLedgerSeq:expiry,delegates:[{address:key.publicKey()}]});const signed=await sdk.authorizeEntry(entry,key,expiry,TESTNET,key.publicKey());const tx=build([signed]);const sim=await server.simulateTransaction(tx,undefined,'enforce');const code=c.id==='wrong-recipient'?6:c.id==='wrong-target'?4:7;const observation={id:c.id,...classifySimulation(sim,policy.account,code)};observations.push(observation);
   transcripts.push({id:c.id,ledger:sim.latestLedger,envelopeXdr:tx.toXDR(),authXdr:signed.toXdr('base64'),diagnosticEventsXdr:sim.events.map(e=>e.toXdr('base64')),error:sdk.rpc.Api.isSimulationError(sim)?sim.error:null,resultXdr:sdk.rpc.Api.isSimulationSuccess(sim)?sim.result.retval.toXdr('base64'):null});
  }catch(e){observations.push({id:c.id,outcome:'error',evidence:String(e.message).slice(0,9000)});}}
  runs.push({fixture:kind,mode:'testnet-enforced-simulation',corpus,observations,report:assess(corpus,observations),transcripts});
 }
 return {kind:'delegatelab-public-testnet-suite',checkedAt:new Date().toISOString(),networkPassphrase:TESTNET,deployment,runs,notice:'Signed authorization simulations against disposable deployed fixtures. Simulation acceptance is not transaction finality or a security proof. Fixtures hold no assets.'};
}
export {sdk};
