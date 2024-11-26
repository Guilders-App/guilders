import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface GuildersMagicLinkEmailProps {
  baseUrl: string;
  magicLink?: string;
}

export const GuildersMagicLinkEmail = ({
  baseUrl,
  magicLink,
}: GuildersMagicLinkEmailProps) => {
  const previewText = `Your Guilders login link`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/assets/logo/logo.svg`}
                width="48"
                height="48"
                alt="Guilders"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Login to Guilders
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Click the button below to securely log in to your Guilders
              account. This link will expire in 24 hours.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={magicLink}
              >
                Log In to Guilders
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you were not expecting this email, you can ignore this. If you
              are concerned about your account's safety, please reply to this
              email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

GuildersMagicLinkEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  magicLink: "https://guilders.app/callback/auth?token_hash=foo&type=magiclink",
} as GuildersMagicLinkEmailProps;

GuildersMagicLinkEmail.SupabaseProps = {
  baseUrl: "{{ .SiteURL }}",
  magicLink:
    "{{ .SiteURL }}/callback/auth?token_hash={{ .TokenHash }}&type=magiclink",
} as GuildersMagicLinkEmailProps;

export default GuildersMagicLinkEmail;
