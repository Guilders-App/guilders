import { insertSaltEdgeInstitutions } from "@/lib/providers/saltedge/functions";
import { insertSnapTradeInstitutions } from "@/lib/providers/snaptrade/functions";
import { insertVezgoInstitutions } from "@/lib/providers/vezgo/functions";

export async function seedInstitutions() {
  console.log("🌱 Seeding institutions...");

  try {
    await insertSnapTradeInstitutions();
    await insertSaltEdgeInstitutions();
    await insertVezgoInstitutions();
    console.log("✅ Successfully seeded institutions");
  } catch (error) {
    console.error("❌ Error seeding institutions:", error);
    process.exit(1);
  }
}
