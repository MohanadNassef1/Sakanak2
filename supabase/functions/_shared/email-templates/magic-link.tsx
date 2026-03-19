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
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Sakanak login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-text-logo.png"
          width="160"
          alt="Sakanak"
          style={{ marginBottom: '24px' }}
        />
        <Heading style={h1}>Your login link 🔗</Heading>
        <Text style={text}>
          Click the button below to log in to Sakanak. This link will expire shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Log In
        </Button>

        <Hr style={divider} />

        <Section style={tipBox}>
          <Text style={tipTitle}>🎯 Boost Your Match Score</Text>
          <Text style={tipText}>
            Complete your profile and verify your identity to increase your compatibility score. Verified profiles with photos get up to +5 extra points!
          </Text>
        </Section>

        <Text style={textAr}>
          اضغط على الزر أعلاه لتسجيل الدخول. الرابط ده هيكون صالح لفترة قصيرة.
        </Text>

        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1F2937',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#64748B',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const textAr = {
  fontSize: '14px',
  color: '#64748B',
  lineHeight: '1.8',
  margin: '16px 0',
  direction: 'rtl' as const,
  textAlign: 'right' as const,
}
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
const footer = { fontSize: '12px', color: '#9CA3AF', margin: '32px 0 0' }
