import nodemailer from 'nodemailer';

async function test(pass) {
  console.log(`Testing with password: "${pass}"`);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nimra121@gmail.com',
      pass: pass,
    },
  });

  try {
    await transporter.sendMail({
      from: 'nimra121@gmail.com',
      to: 'nimra121@gmail.com',
      subject: 'Qalbify Test',
      text: 'Test',
    });
    console.log(`SUCCESS with "${pass}"`);
    return true;
  } catch (e) {
    console.log(`FAILED with "${pass}": ${e.message}`);
    return false;
  }
}

async function run() {
  const p1 = ';rcku ybma giog pavb';
  const p2 = ';rckuybmagiogpavb';
  
  if (await test(p1)) return;
  if (await test(p2)) return;
  
  console.log('Still failing.');
}

run();
