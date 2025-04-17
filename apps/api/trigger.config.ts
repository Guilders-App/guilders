import type {
  ResolveEnvironmentVariablesFunction,
  TriggerConfig,
} from "@trigger.dev/sdk/v3";

export const resolveEnvVars: ResolveEnvironmentVariablesFunction = async ({
  projectRef,
  env,
  environment,
}) => {
  if (
    env.SUPABASE_URL === undefined ||
    env.SUPABASE_SERVICE_ROLE_KEY === undefined
  ) {
    return;
  }

  return {
    variables: {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };
};

export const config: TriggerConfig = {
  project: "proj_sjnpsvovcbtxjbwuccep",
  runtime: "node",
  logLevel: "log",
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
};
