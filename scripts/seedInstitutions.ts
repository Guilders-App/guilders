import { insertSaltEdgeInstitutions } from "@/lib/providers/saltedge/functions";
import { insertSnapTradeInstitutions } from "@/lib/providers/snaptrade/functions";

export async function seedInstitutions() {
  console.log("🌱 Seeding institutions...");

  try {
    await insertSnapTradeInstitutions();
    await insertSaltEdgeInstitutions();
    console.log("✅ Successfully seeded institutions");
  } catch (error) {
    console.error("❌ Error seeding institutions:", error);
    process.exit(1);
  }
}
