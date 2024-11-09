// Base webhook interface that all events extend
interface BaseWebhook {
  webhookId: string;
  clientId: string;
  eventTimestamp: string;
  userId: string;
  eventType: WebhookEventType;
  webhookSecret: string;
}

// All possible webhook event types
type WebhookEventType =
  | "USER_REGISTERED"
  | "USER_DELETED"
  | "CONNECTION_ATTEMPTED"
  | "CONNECTION_ADDED"
  | "CONNECTION_DELETED"
  | "CONNECTION_BROKEN"
  | "CONNECTION_FIXED"
  | "CONNECTION_UPDATED"
  | "CONNECTION_FAILED"
  | "NEW_ACCOUNT_AVAILABLE"
  | "ACCOUNT_TRANSACTIONS_INITIAL_UPDATE"
  | "ACCOUNT_TRANSACTIONS_UPDATED"
  | "ACCOUNT_REMOVED"
  | "TRADES_PLACED"
  | "ACCOUNT_HOLDINGS_UPDATED";

// Connection attempt result types
type ConnectionAttemptResult =
  | "SUCCESS"
  | "AUTH_EXPIRED"
  | "INVALID_AUTH_CODE"
  | "AUTH_NOT_IN_PROGRESS"
  | "DIFFERENT_ACCOUNT"
  | "UNCAUGHT_ERROR"
  | "INVALID_CREDENTIALS"
  | "INVALID_MFA_CODE"
  | "NO_DATA";

// Specific event interfaces
interface UserRegisteredWebhook extends BaseWebhook {
  eventType: "USER_REGISTERED";
}

interface UserDeletedWebhook extends BaseWebhook {
  eventType: "USER_DELETED";
}

interface ConnectionAttemptedWebhook extends BaseWebhook {
  eventType: "CONNECTION_ATTEMPTED";
  connectionAttemptedResult: ConnectionAttemptResult;
  brokerageId: string;
}

interface ConnectionAddedWebhook extends BaseWebhook {
  eventType: "CONNECTION_ADDED";
  brokerageAuthorizationId: string;
  brokerageId: string;
}

interface ConnectionDeletedWebhook extends BaseWebhook {
  eventType: "CONNECTION_DELETED";
  brokerageAuthorizationId: string;
  brokerageId: string;
}

interface ConnectionBrokenWebhook extends BaseWebhook {
  eventType: "CONNECTION_BROKEN";
  brokerageAuthorizationId: string;
}

interface ConnectionFixedWebhook extends BaseWebhook {
  eventType: "CONNECTION_FIXED";
  brokerageAuthorizationId: string;
}

interface ConnectionUpdatedWebhook extends BaseWebhook {
  eventType: "CONNECTION_UPDATED";
  brokerageAuthorizationId: string;
}

interface ConnectionFailedWebhook extends BaseWebhook {
  eventType: "CONNECTION_FAILED";
}

interface NewAccountAvailableWebhook extends BaseWebhook {
  eventType: "NEW_ACCOUNT_AVAILABLE";
  accountId: string;
  brokerageAuthorizationId: string;
  brokerageId: string;
}

interface AccountTransactionsInitialUpdateWebhook extends BaseWebhook {
  eventType: "ACCOUNT_TRANSACTIONS_INITIAL_UPDATE";
  accountId: string;
  brokerageAuthorizationId: string;
  brokerageId: string;
}

interface AccountTransactionsUpdatedWebhook extends BaseWebhook {
  eventType: "ACCOUNT_TRANSACTIONS_UPDATED";
  accountId: string;
  brokerageAuthorizationId: string;
  brokerageId: string;
}

interface AccountRemovedWebhook extends BaseWebhook {
  eventType: "ACCOUNT_REMOVED";
  accountId: string;
  brokerageAuthorizationId: string;
  brokerageId: string;
}

interface TradesPlacedWebhook extends BaseWebhook {
  eventType: "TRADES_PLACED";
  accountId: string;
  brokerageId: string;
  brokerageAuthorizationId: string;
}

interface AccountHoldingsUpdatedWebhook extends BaseWebhook {
  eventType: "ACCOUNT_HOLDINGS_UPDATED";
  accountId: string;
  brokerageId: string;
  brokerageAuthorizationId: string;
  details: {
    total_value: { success: boolean; error: string | null };
    positions: { success: boolean; error: string | null };
    balances: { success: boolean; error: string | null };
    orders: { success: boolean; error: string | null };
  };
}

// Union type of all possible webhook payloads
type SnapTradeWebhook =
  | UserRegisteredWebhook
  | UserDeletedWebhook
  | ConnectionAttemptedWebhook
  | ConnectionAddedWebhook
  | ConnectionDeletedWebhook
  | ConnectionBrokenWebhook
  | ConnectionFixedWebhook
  | ConnectionUpdatedWebhook
  | ConnectionFailedWebhook
  | NewAccountAvailableWebhook
  | AccountTransactionsInitialUpdateWebhook
  | AccountTransactionsUpdatedWebhook
  | AccountRemovedWebhook
  | TradesPlacedWebhook
  | AccountHoldingsUpdatedWebhook;

export type {
  AccountHoldingsUpdatedWebhook,
  AccountRemovedWebhook,
  AccountTransactionsInitialUpdateWebhook,
  AccountTransactionsUpdatedWebhook,
  ConnectionAddedWebhook,
  ConnectionAttemptResult,
  ConnectionAttemptedWebhook,
  ConnectionBrokenWebhook,
  ConnectionDeletedWebhook,
  ConnectionFailedWebhook,
  ConnectionFixedWebhook,
  ConnectionUpdatedWebhook,
  NewAccountAvailableWebhook,
  SnapTradeWebhook,
  TradesPlacedWebhook,
  UserDeletedWebhook,
  // Individual webhook types
  UserRegisteredWebhook,
  WebhookEventType,
};
