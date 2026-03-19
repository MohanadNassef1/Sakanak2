/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for Sakanak</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-text-logo.png"
          width="160"
          alt="Sakanak"
          style={{ marginBottom: '24px' }}
        />
        <Heading style={h1}>Confirm your email change ✉️</Heading>
        <Text style={text}>
          You requested to change your Sakanak email from{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Email Change
        </Button>

        <Text style={textAr}>
          لتأكيد تغيير بريدك الإلكتروني، اضغط على الزر أعلاه.
        </Text>

        <Text style={footer}>
          If you didn't request this change, please secure your account immediately.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const footer = { fontSize: '12px', color: '#9CA3AF', margin: '32px 0 0' }
