import { createAdminClient } from "@/lib/db/admin";

export const inviteUsers = async (email: string) => {
  const supabase = await createAdminClient();
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      invited_at: new Date().toISOString(),
      role: "beta_tester",
    },
  });

  return error;
};

// Default email for testing invites, check inbucket for invitation
inviteUsers("test@test.com");
