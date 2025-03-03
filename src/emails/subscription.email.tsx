import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Tailwind,
  Preview,
  Heading,
  Hr,
  Button,
} from "@react-email/components";

const SubscriptionActivationEmail = ({
  subscriberEmail = "subscriber@example.com",
  subscriptionKey = "1234-5678-91011",
  projectName = "Telegram Gains",
  supportEmail = "support@telegramgains.com",
}: {
  subscriberEmail: string;
  subscriptionKey: string;
  projectName?: string;
  supportEmail?: string;
}) => {
  const handleCopyKey = () => {
    navigator.clipboard.writeText(subscriptionKey);
  };

  return (
    <Html>
      <Head>
        <title>Subscription Activation</title>
      </Head>

      <Preview>{`Activate your subscription with ${projectName}. Use the provided subscription key to complete the process.`}</Preview>

      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Activate Your Subscription with <strong>{projectName}</strong>
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Hello <strong>{subscriberEmail}</strong>,
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for subscribing to <strong>{projectName}</strong>. Below
              is your subscription key to activate your account.
            </Text>

            <Section>
              <Text className="text-black text-lg font-bold text-center">
                Your Subscription Key:
              </Text>

              <Text className="text-black text-2xl font-bold px-4 py-1 text-center -mt-5">
                <i>
                  {" "}
                  <b> {subscriptionKey}</b>
                </i>
              </Text>

              <Button
                className="bg-blue-600 text-white px-4 py-2 rounded-md block mx-auto mt-4"
                onClick={handleCopyKey}
              >
                Copy Subscription Key
              </Button>
            </Section>

            <Section>
              <Text className="text-black text-[14px] leading-[24px]">
                If you encounter any issues during activation, please contact
                our support team at{" "}
                <Link
                  href={`mailto:${supportEmail}`}
                  className="text-blue-600 no-underline"
                >
                  {supportEmail}
                </Link>
                .
              </Text>
            </Section>

            <Section>
              <Text className="text-black text-[14px] leading-[24px]">
                Thank you for choosing {projectName}. We look forward to serving
                you.
              </Text>

              <Text>Best regards,</Text>

              <Text>{projectName} Team</Text>
            </Section>

            <Hr />

            <Section>
              <Text className="text-black text-[14px] leading-[24px]">
                This email and its contents are confidential and intended solely
                for the individual or entity to whom it is addressed. If you
                have received this email in error, please notify the sender and
                delete the email from your system.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SubscriptionActivationEmail;
