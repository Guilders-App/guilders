"use server";

import { createClient } from "@guilders/database/server";
import { getProvider } from "../../db/utils";
import type { ConnectionProviderFunction } from "../types";
import { providerName, snaptrade } from "./client";

export const deregisterSnapTradeUser: ConnectionProviderFunction = async (
  userId: string,
) => {
  const supabase = await createClient();
  const provider = await getProvider(providerName);

  if (!provider) {
    return {
      success: false,
      error: `${providerName} provider not found`,
    };
  }

  const response = await snaptrade.authentication.deleteSnapTradeUser({
    userId,
  });
  if (!response || response.status !== 200) {
    console.error(`${providerName} deregistration error:`, await response.data);
    return {
      success: false,
      error: `Failed to deregister ${providerName} user`,
    };
  }

  const { error } = await supabase
    .from("provider_connection")
    .delete()
    .eq("provider_id", provider.id)
    .eq("user_id", userId);

  if (error) {
    console.error(`${providerName} deregistration error:`, error);
    return {
      success: false,
      error: `Failed to deregister ${providerName} user`,
    };
  }

  return {
    success: true,
  };
};
