import { render } from "@react-email/render";
import { Glob } from "bun";
import path from "path";

async function getAllEmails() {
  const emailsDir = path.join(process.cwd(), "emails");
  const templatesDir = path.join(process.cwd(), "supabase", "templates");
  const glob = new Glob("*.tsx");

  for await (const template of glob.scan(emailsDir)) {
    const { default: EmailComponent } = await import(`../emails/${template}`);
    const supabaseProps = EmailComponent.SupabaseProps;

    if (!supabaseProps) {
      console.error(`No SupabaseProps found for ${template}`);
      continue;
    }

    const html = await render(EmailComponent({ ...supabaseProps }), {
      pretty: true,
    });

    const outputPath = path.join(
      templatesDir,
      `${path.parse(template).name}.html`
    );

    await Bun.write(outputPath, html);
  }
}

await getAllEmails();
