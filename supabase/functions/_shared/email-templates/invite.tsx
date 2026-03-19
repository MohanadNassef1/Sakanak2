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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join Sakanak</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-text-logo.png"
          width="160"
          alt="Sakanak"
          style={{ marginBottom: '24px' }}
        />
        <Heading style={h1}>You've been invited! 🎉</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>Sakanak</strong>
          </Link>
          — Egypt's first & only platform specialized in roommate finding. Click below to accept.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>

        <Hr style={divider} />

        <Heading as="h3" style={h3}>🌟 Why Sakanak?</Heading>

        <Section style={tipBox}>
          <Text style={tipTitle}>🛡️ Identity Verification</Text>
          <Text style={tipText}>
            Every user can verify their identity with a National ID or Passport. No scams, no surprises — just trusted roommates.
          </Text>
        </Section>

        <Section style={tipBox}>
          <Text style={tipTitle}>🎯 Smart Match Score</Text>
          <Text style={tipText}>
            Our algorithm calculates compatibility based on nationality, age, lifestyle, university, and personality to find your ideal roommate.
          </Text>
        </Section>

        <Section style={tipBox}>
          <Text style={tipTitle}>📋 Complete Profile System</Text>
          <Text style={tipText}>
            Build a detailed profile with occupation, personality tags, and living preferences to attract the right matches.
          </Text>
        </Section>

        <Text style={textAr}>
          تم دعوتك للانضمام لسكنك — أول منصة متخصصة في البحث عن زملاء سكن في مصر. وثّق هويتك وكمّل بروفايلك عشان تحصل على أعلى نتيجة توافق!
        </Text>

        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
