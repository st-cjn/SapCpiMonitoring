// Import the cds facade object (https://cap.cloud.sap/docs/node.js/cds-facade)
const cds = require('@sap/cds');
const { log } = require('console');
const { symlinkSync } = require('fs');

// The service implementation with all service handlers
module.exports = cds.service.impl(async function(){

    const { Queue,Message } = this.entities;
    
    this.before("READ",[Queue,Message], async (req,next) => {
        //const result = await INSERT.into(Message).entries({id: '10', queueID:'stc__TEST_Q1__dev',createdAt:'2022-01-03',interface:'if0001',applicationId:'1234567',messageId:'12345',correlationId:'12345',errorMsg:'abcde'})
        //const entries = [result]
    });

    this.on("READ",[Queue,Message], async (req,next) => { 
        //console.log("123456");   
        const queues = await next();
        const asArray = x => Array.isArray(x) ? x : [x]; 
        if(req == "READ QueueService.Queue"){
            console.log("12345");
        } else if(req == "READ QueueService.Queue/messages"){
    
            // Get access token
            const accToken = await getAccToken();
            //console.log("AccessToken: "+accToken);

            //Get queue and message info
            const queueId = (await req._.odataReq._inRequest.url).split("'")[1]
            const queueReqInfo = queueId.split("__");
            var prj = queueReqInfo[0];
            var tnt = queueReqInfo[2];
            var qNm = queueReqInfo[1];

            //// connect to /Queues('<queuename>')/messages
            //// Get Name (queue), CreatedAt
            const queueEdp = await buildEndpoint("/Queues",qNm,"/Messages"); 
            const queueUrl = await buildUrl(prj,tnt,"443",queueEdp,"$format=json")
            //console.log("<<<<<<<<<<<<<<<<<<<<<<<<< /Queues(<queuename>)/Messages Url >>>>>>>>>>>>>>>>>>>>>>>>>"); 
            //console.log(queueUrl); 
            const queueDetails = await httpGet(queueUrl,accToken,"bearer");
            //console.log("<<<<<<<<<<<<<<<<<<<<<<<<< /Queues(<queuename>)/Messages Response >>>>>>>>>>>>>>>>>>>>>>>>>"); 
            //console.log(queueDetails); 
            const jsobjQueue = JSON.parse(queueDetails);
            const queueResultsLst = jsobjQueue.d.results;
            queueResultsLst.forEach(async function(obj) {
                //console.log("<<<<<<<<<<<<<<<<<<<<<<<<< Messages Overview >>>>>>>>>>>>>>>>>>>>>>>>>"); 
                //console.log(obj);  
                const msgId = obj.Mplid;
                const createdAtUnix = obj.CreatedAt;
                var createdAt = new Date(Number(createdAtUnix));
                //// connect to /MessageProcessingLogs('<messageid>')
                //// Get CorrelationId, ApplicationMessageId, BUT NO INTERFACE INFO!!!!!!!!!!!!!!!!!!
                const msgEndpoint = await buildEndpoint("/MessageProcessingLogs",msgId,null); 
                const msgProcLogUrl = await buildUrl(prj,tnt,"443",msgEndpoint,"$format=json")
                //console.log("<<<<<<<<<<<<<<<<<<<<<<<<< /MessageProcessingLogs('<messageid>') Url >>>>>>>>>>>>>>>>>>>>>>>>>"); 
                //console.log(msgProcLogUrl); 
                const msgDetails = await httpGet(msgProcLogUrl,accToken,"bearer");
                const jsobjMsg = JSON.parse(msgDetails);
                const msgDetailsObj = jsobjMsg.d;
                console.log("<<<<<<<<<<<<<<<<<<<<<<<<< Messages Details >>>>>>>>>>>>>>>>>>>>>>>>>"); 
                console.log(msgDetailsObj); 
                const correlationId = msgDetailsObj.CorrelationId;
                var applicationId = msgDetailsObj.ApplicationMessageId; 
                if (applicationId == null) {
                    applicationId = "test00000";
                }
                const interfacce = msgDetailsObj.IntegrationFlowName

                //// connect to /MessageProcessingLogs('<messageid>')/ErrorInformation
                //// Get Error messages
                const errInfoUrl = msgDetailsObj.ErrorInformation.__deferred.uri+"/$value";
                //console.log("<<<<<<<<<<<<<<<<<<<<<<<<< Error Information Uri >>>>>>>>>>>>>>>>>>>>>>>>>"); 
                //console.log(errInfoUrl);
                const errMessage = await httpGet(errInfoUrl,accToken,"bearer");
                //console.log("<<<<<<<<<<<<<<<<<<<<<<<<< Error Messages >>>>>>>>>>>>>>>>>>>>>>>>>"); 
                //console.log(errMessage);
                const rows = await cds.run(SELECT.from(Message));
                console.log("<<<<<<<<<<<<<<<<<<<<<<<<< message rows >>>>>>>>>>>>>>>>>>>>>>>>>"); 
                console.log(rows)
                var count=0
                rows.forEach(async function(row) {
                    if (msgId == row.messageId){
                        count+=1
                    }
                });
                if (count==0){
                    await insertMessages(Message,queueId,createdAt,interfacce,applicationId,msgId,correlationId,errMessage);
                }
                //await insertMessages(Message,queueId,createdAt,interfacce,applicationId,msgId,correlationId,errMessage);  
            });
            //const roles = await cds.run(SELECT.from(Message));
        } 
    });

    this.after("READ",[Queue,Message], async (req,next) => {
        DELETE.from(Message); 
    })

});

async function getAccToken(){
    // get accesstoken
var tokenUrl = 'https://dev-stc.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials';
var cltk = 'sb-b15e6685-8fca-49f5-b7e4-715869ea228a!b241852|it!b182722';
var clts = 'a23f3f08-d001-4512-ad9c-f3d49da0bf6d$kTY4sIutKhunLpYMQywj4-0HQTfeVU1ky09YEPKDlB4=';
var basicAuthToken = btoa(cltk+':'+clts);
const resJsonToken = await httpGet(tokenUrl,basicAuthToken,"basic");
const jsobjToken = JSON.parse(resJsonToken);
const authToken = jsobjToken.access_token;
return authToken;
}

async function buildUrl(prj,tnt,port,endpoint,query){
    var host = 'https://'+tnt+'-'+prj+'.it-cpi024.cfapps.eu10-002.hana.ondemand.com';
    var servicePath = '/api/v1';
    var url = host+':'+port+servicePath+endpoint;
    if (query !=null && query != '' ){
        return url+'?'+query;
    }else{
        return url;
    }
}

async function buildEndpoint(entity,id,navPath){
    var endpoint = '';
    if (entity !=null && entity != '' ){
        endpoint += entity;
    };

    if (id !=null && id != '' ){
        endpoint = endpoint + "('"+id+ "')";
    };

    if (navPath !=null && navPath != '' ){
        endpoint += navPath;
    };
    return endpoint;
}

async function httpGet(url,authToken,TypeToken){
    var myHeadersAPI = new Headers();
    if(TypeToken=="basic"){
        authToken = "Basic "+authToken
    } else if (TypeToken=="bearer") {
        authToken = "bearer "+authToken
    }
    myHeadersAPI.append("Authorization", authToken);
    var requestOptionsAPI = {
        method: 'GET',
        headers: myHeadersAPI,
        redirect: 'follow'
    };
    const responseQueue = await fetch(url, requestOptionsAPI)
    .catch(error => console.log('error', error));
    const resJsonQueue = await responseQueue.text();
    return resJsonQueue;
}

async function insertMessages(msgTable,queId,crtAt,inf,appId,msgId,corId,errMsg){
    const insertMsg = await cds.run(
        INSERT.into(msgTable).entries([
          {
            ID: cds.utils.uuid(),
            queueID: queId,
            createdAt: crtAt,
            interface: inf,
            applicationId: appId,
            messageId: msgId,
            correlationId: corId,
            errorMsg: errMsg
          },
        ])
      );
      const keyFields = [...insertMsg];
      //delete keyFields.IsActiveEntity;
      //const roles = await cds.run(SELECT.from(Message).where(keyFields));
      //const roles = await cds.run(SELECT.from(msgTable));
      //const role = roles[0];
      //return role;
}

async function processingUnixTimestamp(unixTimeStamp){
    var createdAt = new Date(unixTimeStamp * 1000);

}
