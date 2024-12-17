import { createClient } from "@guilders/database/client";
import { create } from "zustand";

interface SecurityStore {
  hasMFA: boolean;
  isLoadingMFA: boolean;
  checkMFAStatus: () => Promise<void>;
  unenrollMFA: () => Promise<void>;
}

export const useSecurityStore = create<SecurityStore>((set, get) => ({
  hasMFA: false,
  isLoadingMFA: true,

  checkMFAStatus: async () => {
    const supabase = createClient();
    try {
      set({ isLoadingMFA: true });
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      if (data.all.length > 0) {
        if (data.all[0].status === "unverified") {
          await supabase.auth.mfa.unenroll({
            factorId: data.all[0].id,
          });
          set({ hasMFA: false });
        } else {
          set({ hasMFA: true });
        }
      } else {
        set({ hasMFA: false });
      }
    } catch (error) {
      console.error("Error checking MFA status:", error);
    } finally {
      set({ isLoadingMFA: false });
    }
  },

  unenrollMFA: async () => {
    const supabase = createClient();
    try {
      set({ isLoadingMFA: true });
      const { data } = await supabase.auth.mfa.listFactors();
      if (!data) throw new Error("No MFA factors found");

      const totpFactor = data.totp[0];
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id,
        });
        if (error) throw error;
        set({ hasMFA: false });
      }
    } catch (error) {
      console.error("Error unenrolling MFA:", error);
    } finally {
      set({ isLoadingMFA: false });
    }
  },
}));
