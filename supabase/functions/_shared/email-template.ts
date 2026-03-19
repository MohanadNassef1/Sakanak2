/**
 * Shared Sakanak email template wrapper
 * Professional, mobile-friendly, consistent branding across all emails
 */

const BRAND_COLOR = '#FF7A00';
const BRAND_COLOR_DARK = '#E56B00';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#555555';
const TEXT_MUTED = '#888888';
const TEXT_FOOTER = '#aaaaaa';
const BG_WHITE = '#ffffff';
const BG_LIGHT = '#f9fafb';
const BORDER_LIGHT = '#e5e7eb';

export interface EmailTemplateOptions {
  recipientName?: string;
  subject: string;
  preheader?: string; // Preview text in inbox
  heading: string;
  headingEmoji?: string;
  body: string; // HTML body content
  ctaText?: string;
  ctaUrl?: string;
  ctaColor?: string; // Override button color
  footerNote?: string; // Extra note above main footer
}

export function buildEmailHtml(options: EmailTemplateOptions): string {
  const {
    preheader,
    heading,
    headingEmoji,
    body,
    ctaText,
    ctaUrl,
    ctaColor = BRAND_COLOR,
    footerNote,
  } = options;

  const ctaButton = ctaText && ctaUrl ? `
    <tr>
      <td align="center" style="padding: 8px 0 24px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="border-radius: 8px; background-color: ${ctaColor};">
              <a href="${ctaUrl}" target="_blank"
                 style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; background-color: ${ctaColor};">
                ${ctaText}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : '';

  const footerNoteHtml = footerNote ? `
    <tr>
      <td style="padding: 0 0 16px 0;">
        <p style="margin: 0; font-size: 13px; line-height: 1.5; color: ${TEXT_MUTED}; text-align: center;">
          ${footerNote}
        </p>
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${heading}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .content-cell { padding: 24px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main container -->
        <table role="presentation" class="container" width="580" cellpadding="0" cellspacing="0" border="0" style="background-color: ${BG_WHITE}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px 40px; border-bottom: 1px solid ${BORDER_LIGHT};">
              <a href="https://sakanakeg.com" target="_blank" style="text-decoration: none;">
                <img src="https://lmjivfayjyskriikcyzg.supabase.co/storage/v1/object/public/email-assets/sakanak-text-logo.png" alt="Sakanak" width="180" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
              </a>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: ${TEXT_MUTED}; letter-spacing: 0.5px;">
                سكنك
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td class="content-cell" style="padding: 32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                
                <!-- Heading -->
                <tr>
                  <td style="padding: 0 0 20px 0;">
                    <h2 style="margin: 0; font-size: 22px; font-weight: 600; color: ${TEXT_PRIMARY}; line-height: 1.3;">
                      ${headingEmoji ? `${headingEmoji} ` : ''}${heading}
                    </h2>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${TEXT_SECONDARY};">
                    ${body}
                  </td>
                </tr>

                <!-- CTA Button -->
                ${ctaButton}

                <!-- Footer Note -->
                ${footerNoteHtml}

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: ${BG_LIGHT}; border-top: 1px solid ${BORDER_LIGHT};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: ${TEXT_PRIMARY};">
                      Sakanak
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: ${TEXT_FOOTER};">
                      Find Rooms & Roommates in Egypt
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: ${TEXT_FOOTER};">
                      لاقي سكنك المثالي في مصر
                    </p>
                    <p style="margin: 0 0 4px 0;">
                      <a href="https://sakanakeg.com" style="font-size: 12px; color: ${BRAND_COLOR}; text-decoration: none;">
                        sakanakeg.com
                      </a>
                    </p>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: ${TEXT_FOOTER};">
                      Need help? Contact us at
                      <a href="mailto:support@sakanakeg.com" style="color: ${BRAND_COLOR}; text-decoration: none;">
                        support@sakanakeg.com
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Builds a status card (success, warning, error) for use inside the email body
 */
export function statusCard(opts: { emoji: string; title: string; titleAr?: string; bgColor: string; borderColor: string; textColor: string }): string {
  return `
    <div style="background: ${opts.bgColor}; border: 1px solid ${opts.borderColor}; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 20px 0;">
      <div style="font-size: 40px; margin-bottom: 8px;">${opts.emoji}</div>
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: ${opts.textColor};">${opts.title}</p>
      ${opts.titleAr ? `<p style="margin: 4px 0 0 0; font-size: 14px; color: ${opts.textColor}; direction: rtl;">${opts.titleAr}</p>` : ''}
    </div>
  `;
}

/**
 * Builds an info box for details
 */
export function infoBox(content: string, accentColor: string = BRAND_COLOR): string {
  return `
    <div style="background: #f9fafb; border-left: 4px solid ${accentColor}; padding: 16px; border-radius: 4px; margin: 0 0 16px 0;">
      ${content}
    </div>
  `;
}
