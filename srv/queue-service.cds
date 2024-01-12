using { sap.cpimonitor as my } from '../db/schema';

service QueueService{
    entity Queue as projection on my.Queue;
        
    entity Message as projection on my.Message;
}

/**
service QueueService@(requires: 'authenticated-user'){
    entity Queue @(restrict:[
            {
                grant: 'READ',
                to: 'CPIMonitoringMember'
            },
            {
                grant: [
                    'READ',
                    'WRITE',
                    'UPDATE',
                    'UPSERT',
                    'DELETE'
                ],
                to: 'CPIMonitoringAdministractor'
            }
        ]) as projection on my.Queue;
        
    entity Message@(restrict:[
            {
                grant: 'READ',
                to: 'CPIMonitoringMember'
            },
            {
                grant: '*',
                to: 'CPIMonitoringAdministractor'
            }
        ]) as projection on my.Message;
}

 */