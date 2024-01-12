namespace sap.cpimonitor;

entity Queue {
    key id : String;
    project: String;
    queueName : String;
    tenant : String;
    messages: Association to many Message on messages.queueID = $self.id;
}

entity Message {
    key id: UUID;
    queueID: String;
    createdAt:DateTime;
    interface:String;
    applicationId: String;
    messageId: String;
    correlationId:String;
    errorMsg: String;
    queues: Association to Queue on queues.id = queueID;
}
