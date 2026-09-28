const nodemailer = require('nodemailer');

// Configure Nodemailer transporter using Gmail App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kavindujayasingheit@gmail.com',
    pass: 'rfma wiun njyg shvg'
  }
});

/**
 * Send automated payment reminder email to customer
 */
const sendPaymentReminderEmail = async (toEmail, customerName, rentalInfo, alertCategory) => {
  try {
    let subject = '';
    let categoryBadge = '';

    switch (alertCategory) {
      case '7_DAYS':
        subject = `🟢 Payment Reminder: 7 Days Remaining - Juki Sewing Centre`;
        categoryBadge = '7 Days Remaining';
        break;
      case '3_DAYS':
        subject = `🟡 Urgent Reminder: 3 Days Remaining - Juki Sewing Centre`;
        categoryBadge = '3 Days Remaining';
        break;
      case 'DUE_TODAY':
        subject = `🟠 Payment Due Today - Juki Sewing Centre`;
        categoryBadge = 'Due Today';
        break;
      case 'OVERDUE':
        subject = `🔴 Overdue Notice: Rental Payment Past Due - Juki Sewing Centre`;
        categoryBadge = 'OVERDUE';
        break;
      default:
        subject = `Payment Notice - Juki Sewing Centre`;
        categoryBadge = 'Notice';
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; borderRadius: 16px;">
        <div style="max-width: 600px; margin: 0 auto; background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155;">
          <h2 style="color: #6366f1; margin-top: 0;">Juki Sewing Machine Centre (Pvt) Ltd</h2>
          <p style="font-size: 14px; color: #94a3b8;">Sri Lanka Rental & Inventory Operations</p>
          <hr style="border-color: #334155; margin: 20px 0;" />
          
          <p style="font-size: 16px; font-weight: bold; color: #ffffff;">Dear ${customerName},</p>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            This is an automated notification regarding your active machine rental agreement <strong>(${rentalInfo.rentalId})</strong>.
          </p>

          <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 13px; color: #94a3b8;">Alert Status: <strong style="color: #f59e0b;">${categoryBadge}</strong></p>
            <p style="margin: 6px 0; font-size: 13px; color: #94a3b8;">Monthly Rent Amount: <strong style="color: #10b981;">LKR ${(rentalInfo.monthlyRentAmount || 0).toLocaleString()}</strong></p>
            <p style="margin: 6px 0; font-size: 13px; color: #94a3b8;">Payment Due Date: <strong style="color: #6366f1;">${new Date(rentalInfo.dueDate).toLocaleDateString()}</strong></p>
          </div>

          <p style="font-size: 14px; color: #cbd5e1;">
            Please kindly settle your payment via Bank Transfer or Cash to avoid disruption of service.
          </p>

          <div style="background: #182235; padding: 14px; border-radius: 8px; font-size: 12px; color: #94a3b8; margin-top: 20px;">
            <strong>Bank Details:</strong> Commercial Bank of Ceylon | Acc: 1000-2938-4720 | Juki Sewing Machine Centre
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 30px; text-align: center;">
            Juki Sewing Machine Centre • Colombo, Sri Lanka • Phone: +94 11 234 5678
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Juki Rental System" <kavindujayasingheit@gmail.com>`,
      to: toEmail,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email reminder sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email reminder:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendPaymentReminderEmail
};
