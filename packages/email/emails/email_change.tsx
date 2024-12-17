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

interface GuildersEmailChangeProps {
  baseUrl: string;
  changeLink?: string;
  currentEmail?: string;
  newEmail?: string;
}

export const GuildersEmailChangeEmail = ({
  baseUrl,
  changeLink,
  currentEmail,
  newEmail,
}: GuildersEmailChangeProps) => {
  const previewText = "Confirm your email change request";

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
              Confirm your new email address
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Please confirm that you want to change your email address from{" "}
              <strong>{currentEmail}</strong> to <strong>{newEmail}</strong>.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={changeLink}
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

GuildersEmailChangeEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  changeLink:
    "https://guilders.app/callback/auth?token_hash=foo&type=email_change",
  currentEmail: "current@example.com",
  newEmail: "new@example.com",
} as GuildersEmailChangeProps;

GuildersEmailChangeEmail.SupabaseProps = {
  baseUrl: "{{ .SiteURL }}",
  changeLink:
    "{{ .SiteURL }}/callback/auth?token_hash={{ .TokenHash }}&type=email_change",
  currentEmail: "{{ .Email }}",
  newEmail: "{{ .NewEmail }}",
} as GuildersEmailChangeProps;

export default GuildersEmailChangeEmail;
