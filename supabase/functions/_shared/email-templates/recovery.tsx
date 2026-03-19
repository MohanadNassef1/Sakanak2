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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your Sakanak password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-text-logo.png"
          width="160"
          alt="Sakanak"
          style={{ marginBottom: '24px' }}
        />
        <Heading style={h1}>Reset your password 🔐</Heading>
        <Text style={text}>
          We received a request to reset your Sakanak password. Click
          the button below to choose a new one.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>

        <Hr style={divider} />

        <Section style={tipBox}>
          <Text style={tipTitle}>💡 While you're back...</Text>
          <Text style={tipText}>
            Make sure your profile is complete and your identity is verified! Verified users earn the trusted badge and get higher compatibility scores with potential roommates.
          </Text>
        </Section>

        <Text style={textAr}>
          اضغط على الزر أعلاه لإعادة تعيين كلمة المرور. لو مش إنت اللي طلبت ده، تجاهل الإيميل ده.
        </Text>

        <Text style={footer}>
          If you didn't request this, you can safely ignore this email.
          Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
