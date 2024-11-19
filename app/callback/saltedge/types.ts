export type SaltEdgeCallbackBody = {
  data: {
    connection_id: string;
    customer_id: string;
    custom_fields: {
      institution_id: string;
      user_id: string;
    };
    stage:
      | "connect"
      | "start"
      | "fetch_accounts"
      | "fetch_transactions"
      | "finish_fetching"
      | "finish"
      | "error";
  };
  meta: {
    version: string;
    time: string;
  };
};
