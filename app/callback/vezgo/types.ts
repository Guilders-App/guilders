export type VezgoCallbackBody =
  | {
      hook: "SyncAccount";
      user: {
        id: string;
        loginName: string;
      };
      account: {
        id: string;
        provider: string;
      };
    }
  | {
      hook: "SyncError";
      user: {
        id: string;
        loginName: string;
      };
      account: {
        id: string;
        provider: string;
      };
      error:
        | "LoginFailedError"
        | "SecurityQuestionError"
        | "TemporaryFailureError";
    };
