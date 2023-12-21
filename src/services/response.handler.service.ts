import { IResponseHandlerData, IResponseHandlerParams } from 'src/interfaces';

export const ResponseHandlerService = (params: IResponseHandlerParams) => {
  const res: IResponseHandlerData = {
    timeRequested: new Date().toISOString(),
    callId: Date.now(),
    ...params,
  };

  return res;
};
