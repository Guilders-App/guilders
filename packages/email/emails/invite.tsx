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
  const previewText = "You've been invited to join Guilders";

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
              Welcome to the <strong>Guilders Beta</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Great news!
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You've been selected to be one of our beta testers for Guilders.
              We're excited to have you join us in shaping the future of
              personal finance management.
            </Text>
            <Text className="text-black text-[14px] leading-[24px] m-0">
              As a beta tester, you'll get:
              <ul className="list-disc pl-6 mt-2 text-[14px]">
                <li>Early access to all Guilders features</li>
                <li>Direct communication channel with our development team</li>
                <li>Opportunity to influence product development</li>
                <li>Extended beta period access at no cost</li>
              </ul>
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={inviteLink}
              >
                Join the Beta
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation is exclusive and the link will expire in 7 days.
              If you have any questions or need assistance, please reply to this
              email - we're here to help!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

GuildersInviteUserEmail.PreviewProps = {
  baseUrl: "http://localhost:3001",
  inviteLink:
    "http://localhost:3001/callback/auth?token_hash=foo&type=invite&redirect_to=/onboarding",
} as GuildersInviteUserEmailProps;

GuildersInviteUserEmail.SupabaseProps = {
  baseUrl: "{{ .SiteURL }}",
  inviteLink:
    "{{ .SiteURL }}/callback/auth?token_hash={{ .TokenHash }}&type=invite&redirect_to=/onboarding",
} as GuildersInviteUserEmailProps;

export default GuildersInviteUserEmail;
