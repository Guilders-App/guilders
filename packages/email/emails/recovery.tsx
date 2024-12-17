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

interface GuildersRecoveryEmailProps {
  baseUrl: string;
  recoveryLink?: string;
}

export const GuildersRecoveryEmail = ({
  baseUrl,
  recoveryLink,
}: GuildersRecoveryEmailProps) => {
  const previewText = "Reset your Guilders password";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/assets/logo/logo.png`}
                width="48"
                height="48"
                alt="Guilders"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Reset Your Password
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              We received a request to reset your Guilders password. Click the
              button below to choose a new password. If you didn't request this
              change, you can ignore this email.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={recoveryLink}
              >
                Reset Password
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px] mt-[32px]">
              For security, this request was received from your device. This
              password reset link will expire in 24 hours. If you were not
              expecting this email, you can ignore this. If you are concerned
              about your account's safety, please reply to this email to get in
              touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

GuildersRecoveryEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  recoveryLink:
    "https://guilders.app/callback/auth?token_hash=foo&type=recovery&redirect_to=/settings/security",
} as GuildersRecoveryEmailProps;

GuildersRecoveryEmail.SupabaseProps = {
  baseUrl: "{{ .SiteURL }}",
  recoveryLink:
    "{{ .SiteURL }}/callback/auth?token_hash={{ .TokenHash }}&type=recovery&redirect_to=/recovery",
} as GuildersRecoveryEmailProps;

export default GuildersRecoveryEmail;
