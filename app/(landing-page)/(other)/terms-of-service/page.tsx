import { Markdown } from "@/components/landing-page/markdown";

const termsOfServiceContent = `
# Terms of Service
`;

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Markdown content={termsOfServiceContent} />
    </div>
  );
}
