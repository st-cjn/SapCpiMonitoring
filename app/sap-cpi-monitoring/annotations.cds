using QueueService as service from '../../srv/queue-service';

annotate service.Queue with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'id',
            Value : id,
        },
        {
            $Type : 'UI.DataField',
            Label : 'project',
            Value : project,
        },
        {
            $Type : 'UI.DataField',
            Label : 'queueName',
            Value : queueName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'tenant',
            Value : tenant,
        },
    ]
);
annotate service.Queue with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'id',
                Value : id,
            },
            {
                $Type : 'UI.DataField',
                Label : 'project',
                Value : project,
            },
            {
                $Type : 'UI.DataField',
                Label : 'queueName',
                Value : queueName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'tenant',
                Value : tenant,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Messages with Error',
            ID : 'MessageswithError',
            Target : 'messages/@UI.LineItem#MessageswithError',
        },]
);
annotate service.Message with @(
    UI.LineItem #MessageswithError : [
        {
            $Type : 'UI.DataField',
            Value : createdAt,
            Label : 'createdAt',
        },{
            $Type : 'UI.DataField',
            Value : interface,
            Label : 'interface',
        },{
            $Type : 'UI.DataField',
            Value : applicationId,
            Label : 'applicationId',
        },{
            $Type : 'UI.DataField',
            Value : messageId,
            Label : 'messageId',
        },{
            $Type : 'UI.DataField',
            Value : correlationId,
            Label : 'correlationId',
        },{
            $Type : 'UI.DataField',
            Value : errorMsg,
            Label : 'errorMsg',
        },]
);
