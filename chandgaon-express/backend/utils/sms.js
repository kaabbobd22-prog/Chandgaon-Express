const axios = require('axios');

/**
 * Send SMS via BulkSMSBD
 * @param {string} phone - BD phone number (e.g. 01XXXXXXXXX)
 * @param {string} message - SMS text
 */
const sendSMS = async (phone, message) => {
  try {
    // Bulk SMS BD এর রিকোয়েস্টের জন্য নাম্বারের শুরুতে 88 যোগ করা হচ্ছে (যদি না থাকে)
    const formattedPhone = phone.startsWith('88') ? phone : `88${phone}`;

    const url = 'http://bulksmsbd.net/api/smsapi';
    const response = await axios.post(url, null, {
      params: {
        api_key: process.env.BULKSMSBD_API_KEY,
        senderid: process.env.BULKSMSBD_SENDER_ID,
        number: formattedPhone, // ডাইনামিক ফোন নাম্বার
        message: message        // ডাইনামিক মেসেজ টেক্সট
      },
    });

    // Bulk SMS BD থেকে যদি কোনো এরর রেসপন্স আসে তা চেক করা হচ্ছে
    if (response.data.response_code === 1003 || response.data.error_message) {
      console.error('❌ SMS API Error:', response.data.error_message);
      return { success: false, error: response.data.error_message };
    }

    console.log('✅ SMS sent to', formattedPhone, '| Response:', response.data);
    return { success: true, data: response.data };

  } catch (err) {
    console.error('❌ SMS Request Error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Send OTP SMS
 */
const sendOTP = async (phone, otp) => {
  const message = `চাঁদগাঁও এক্সপ্রেস: আপনার OTP হলো ${otp}। এটি ${process.env.OTP_EXPIRES_IN || 5} মিনিটের জন্য বৈধ। কাউকে শেয়ার করবেন না।`;
  return sendSMS(phone, message);
};

/**
 * Send order confirmation SMS
 */
const sendOrderConfirmation = async (phone, orderId, amount) => {
  const message = `চাঁদগাঁও এক্সপ্রেস: আপনার অর্ডার #${orderId} কনফার্ম হয়েছে। মোট: ৳${amount}। ডেলিভারি ম্যান শীঘ্রই আসবেন।`;
  return sendSMS(phone, message);
};

/**
 * Send delivery assigned SMS
 */
const sendDeliveryAssigned = async (phone, riderName) => {
  const message = `চাঁদগাঁও এক্সপ্রেস: ${riderName} আপনার অর্ডার নিয়ে রওনা দিয়েছেন। শীঘ্রই পৌঁছাবেন।`;
  return sendSMS(phone, message);
};

module.exports = { 
  sendSMS, 
  generateOTP, 
  sendOTP, 
  sendOrderConfirmation, 
  sendDeliveryAssigned 
};