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
