/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Sakanak – Verify your email to get started</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-text-logo.png"
          width="160"
          alt="Sakanak"
          style={{ marginBottom: '24px' }}
        />
        <Heading style={h1}>Welcome to Sakanak! 🎉</Heading>
        <Text style={text}>
          Thanks for joining{' '}
          <Link href={siteUrl} style={link}>
            <strong>Sakanak</strong>
          </Link>
          — Egypt's first & only platform specialized in roommate finding.
        </Text>
        <Text style={text}>
          Please verify your email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) to get started:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>

        <Hr style={divider} />

        <Heading as="h3" style={h3}>🚀 What's next after verifying?</Heading>

        <Section style={tipBox}>
          <Text style={tipTitle}>✅ Complete Your Profile</Text>
          <Text style={tipText}>
            Add your photo, occupation, personality tags, and preferences. A complete profile helps you stand out and find the perfect match faster.
          </Text>
        </Section>

        <Section style={tipBox}>
          <Text style={tipTitle}>🛡️ Verify Your Identity</Text>
          <Text style={tipText}>
            Upload your National ID or Passport to earn the <strong style={{ color: '#FF7A00' }}>Verified Badge</strong>. Verified users get +3 points on their compatibility score and build instant trust with other users.
          </Text>
        </Section>

        <Section style={tipBox}>
          <Text style={tipTitle}>🎯 Smart Compatibility Matching</Text>
          <Text style={tipText}>
            Sakanak calculates a match score based on nationality, age, university, lifestyle, and personality. The more you complete your profile, the more accurate your matches become!
          </Text>
        </Section>

        <Text style={textAr}>
          أهلاً بيك في Sakanak! أول منصة متخصصة في البحث عن سكن وزملاء سكن في مصر. فعّل حسابك دلوقتي وكمّل بروفايلك عشان تلاقي السكن المثالي ليك.
        </Text>

        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1F2937',
  margin: '0 0 20px',
}
const h3 = {
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#1F2937',
  margin: '0 0 16px',
}
const text = {
  fontSize: '14px',
  color: '#64748B',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const textAr = {
  fontSize: '14px',
  color: '#64748B',
  lineHeight: '1.8',
  margin: '16px 0',
  direction: 'rtl' as const,
  textAlign: 'right' as const,
  borderTop: '1px solid #e5e7eb',
  paddingTop: '16px',
}
const link = { color: '#FF7A00', textDecoration: 'underline' }
const button = {
  backgroundColor: '#FF7A00',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const divider = { borderColor: '#e5e7eb', margin: '24px 0' }
const tipBox = {
  backgroundColor: '#FFF7ED',
  borderLeft: '4px solid #FF7A00',
  borderRadius: '4px',
  padding: '12px 16px',
  marginBottom: '12px',
}
const tipTitle = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#1F2937',
  margin: '0 0 4px',
}
const tipText = {
  fontSize: '13px',
  color: '#64748B',
  lineHeight: '1.5',
  margin: '0',
}
const footer = { fontSize: '12px', color: '#9CA3AF', margin: '24px 0 0' }
