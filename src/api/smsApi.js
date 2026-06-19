import moolreClient from './moolreClient';

/**
 * SMS API — OTPs and bulk notifications.
 * Used by: Price Board module (daily price bulletin push),
 * registration (OTP verification), Subsidy/Marketplace (alerts).
 *
 * TODO: confirm exact endpoint paths against current Moolre docs.
 */

export async function sendOtp(phone) {
  const { data } = await moolreClient.post(`/sms/otp/send`, { phone });
  return data;
}

export async function verifyOtp(phone, code) {
  const { data } = await moolreClient.post(`/sms/otp/verify`, { phone, code });
  return data;
}

export async function sendBulkSms(recipients, message) {
  const { data } = await moolreClient.post(`/sms/bulk`, {
    recipients, // array of phone numbers
    message,
  });
  return data;
}
