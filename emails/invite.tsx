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

interface GuildersInviteUserEmailProps {
  baseUrl: string;
  inviteLink?: string;
}

export const GuildersInviteUserEmail = ({
  baseUrl,
  inviteLink,
}: GuildersInviteUserEmailProps) => {
  const previewText = `You've been invited to join Guilders`;

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
              Welcome to <strong>Guilders</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hey there,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You've been invited to join <strong>Guilders</strong>, your
              personal AI-powered financial companion. Whether you're managing
              investments, tracking assets, or planning budgets, Guilders helps
              you make smarter financial decisions with personalized insights
              and automated account syncing.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Get Started
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              If you were not expecting this invitation, you can ignore this
              email. If you are concerned about your account's safety, please
              reply to this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

GuildersInviteUserEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  inviteLink: "https://guilders.app/callback/auth?token_hash=foo&type=invite",
} as GuildersInviteUserEmailProps;

GuildersInviteUserEmail.SupabaseProps = {
  baseUrl: "{{ .SiteURL }}",
  inviteLink:
    "{{ .SiteURL }}/callback/auth?token_hash={{ .TokenHash }}&type=invite",
} as GuildersInviteUserEmailProps;

export default GuildersInviteUserEmail;
