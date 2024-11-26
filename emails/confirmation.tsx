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

interface GuildersConfirmationEmailProps {
  baseUrl: string;
  confirmationLink?: string;
}

export const GuildersConfirmationEmail = ({
  baseUrl,
  confirmationLink,
}: GuildersConfirmationEmailProps) => {
  const previewText = `Confirm your Guilders account`;

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
              Confirm your email address
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Thanks for signing up for Guilders! Please confirm your email
              address by clicking the button below.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmationLink}
              >
                Confirm Email
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

GuildersConfirmationEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  confirmationLink:
    "https://guilders.app/callback/auth?token_hash=foo&type=signup",
} as GuildersConfirmationEmailProps;

GuildersConfirmationEmail.SupabaseProps = {
  baseUrl: "{{ .SiteURL }}",
  confirmationLink:
    "{{ .SiteURL }}/callback/auth?token_hash={{ .TokenHash }}&type=signup",
} as GuildersConfirmationEmailProps;

export default GuildersConfirmationEmail;
