import fs from "node:fs/promises";
import path from "node:path";
import { render } from "@react-email/render";

async function getAllEmails() {
  const emailsDir = path.join(process.cwd(), "emails");
  const templatesDir = path.join(process.cwd(), "supabase", "templates");

  const files = await fs.readdir(emailsDir);
  const templates = files.filter((file) => file.endsWith(".tsx"));

  for (const template of templates) {
    const { default: EmailComponent } = await import(`emails/${template}`);
    const supabaseProps = EmailComponent.SupabaseProps;

    if (!supabaseProps) {
      console.error(`No SupabaseProps found for ${template}`);
      continue;
    }

    const html = await render(EmailComponent({ ...supabaseProps }));

    const outputPath = path.join(
      templatesDir,
      `${path.parse(template).name}.html`,
    );

    await fs.writeFile(outputPath, html);
  }
}

getAllEmails().catch(console.error);
