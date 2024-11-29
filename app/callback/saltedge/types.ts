export type SaltEdgeCallbackBase = {
  meta: {
    version: string;
    time: string;
  };
};

export type SaltEdgeSuccessCallback = SaltEdgeCallbackBase & {
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
      | "finish";
  };
};

export type SaltEdgeFailureCallback = SaltEdgeCallbackBase & {
  data: {
    connection_id: string;
    customer_id: string;
    custom_fields: {
      institution_id: string;
      user_id: string;
    };
    error_class: string;
    error_message: string;
  };
};

export type SaltEdgeDestroyCallback = SaltEdgeCallbackBase & {
  data: {
    connection_id: string;
    customer_id: string;
    custom_fields: {
      institution_id: string;
      user_id: string;
    };
  };
};

export type SaltEdgeProviderCallback = SaltEdgeCallbackBase & {
  data: {
    provider_status: "active" | "inactive";
    provider_code: string;
  };
};

export type SaltEdgeCallback =
  | SaltEdgeSuccessCallback
  | SaltEdgeFailureCallback
  | SaltEdgeDestroyCallback
  | SaltEdgeProviderCallback;
