export type MonitoringCall = {
  callType: "MULTI_CHANNEL" | "INTERNAL" | "SINGLE_CHANNEL" | "CONFERENCE";
  callerNumberShort: string;
  callerNumberFull: string;
  calledNumberShort: string;
  calledNumberFull: string;
};

export type MonitoringCallPending = {
  queueName: string;
  calls: string[];
};

export type Employee = {
  employeeId: number;
  email: string;
  name: string;
  surname: string;
  fullNumber: string;
  shortNumber: string;
  groupName: string;
};

export type FileInfo = {
  date: Date;
  callType:
    | "SINGLE_CHANNEL"
    | "MULTI_CHANNEL"
    | "UNKNOWN_CALL"
    | "INTERNAL"
    | "HIMSELF"
    | "INTERNAL_QUEUE"
    | "CRM_OUTGOING"
    | "VOICEMAIL"
    | "CONFERENCE"
    | "CALLBACK"
    | "PICKUP_CALL"
    | "FAX"
    | "OUTGOING"
    | "CRM_CALLBACK";
  callStatus:
    | "ANSWERED_COMMON"
    | "ANSWERED_BY_ORIGINAL_CLIENT"
    | "ANSWERED_BY_BUSY_FORWARD_CLIENT"
    | "ANSWERED_BY_NO_ANSWER_FORWARD_CLIENT"
    | "NOT_ANSWERED_COMMON"
    | "CANCELLED_BY_CALLER"
    | "DENIED_DUE_TO_MAX_SESSION"
    | "DENIED_DUE_TO_INCOMING_CALLS_BLOCKED"
    | "DENIED_DUE_TO_OUTGOING_CALLS_BLOCKED"
    | "DENIED_DUE_TO_ONLY_INTERNAL_CALLS_ENABLED"
    | "DENIED_DUE_TO_BLACK_LISTED"
    | "DENIED_NOT_IN_WHITE_LIST"
    | "DENIED_DUE_TO_NOT_WORK_TIME"
    | "DENIED_DUE_TO_UNKNOWN_NUMBER"
    | "DESTINATION_BUSY"
    | "CANCELLED_BY_PICKUP";
  destinationNumber: string;
  callerNumber: string;
  callerName: string;
  calleeNumber: string;
  calleeName: string;
  callDuration: number;
  conversationDuration: number;
  recordFileName?: string;
  recordFileUri?: string;
};
