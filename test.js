const http = require('https');

const options = {
  method: 'POST',
  hostname: 'control.msg91.com',
  port: null,
  path: 'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/?integrated_number=919064090674&recipient_number=917679349780&content_type=text&text=Hi+This+is+test+sms',
  headers: {
    authkey: '440406ALF3BVm19I67b8cbe9P1',
    accept: 'application/json',
    'Content-type': 'application/json',
  },
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();
