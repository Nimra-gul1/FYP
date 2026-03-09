import formData from 'form-data';
import Mailgun from 'mailgun.js';
try {
    const mailgun = new Mailgun(formData);
    console.log('Mailgun initialized');
} catch (e) {
    console.error('Mailgun error:', e);
}
