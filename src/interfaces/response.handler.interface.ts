export interface IResponseHandlerData {
  timeRequested: string;
  callId: number;
  success: boolean;
  httpCode?: number;
  statusCode?: string;
  message?: string;
  data?: any;
  errorDetails?: any;
}

export interface IResponseHandlerParams {
  success: boolean;
  httpCode?: number;
  statusCode?: string;
  message?: string;
  field?: string;
  data?: any;
  errorDetails?: any;
}
