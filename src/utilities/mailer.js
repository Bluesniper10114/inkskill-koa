const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { promisify } = require('util');

const templatesDir = path.resolve(__dirname, '../templates');
const baseTemplatePath = path.resolve(templatesDir, '_mail.hbs');
let baseTemplate;

const development = {
  streamTransport: true,
  newline: 'unix',
  buffer: true
};
const production = {
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
};

const isDev = process.env.NODE_ENV === 'development';
const config = isDev ? development : production;
const transporter = nodemailer.createTransport(config);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const debugMail = async (mail) => {
  const file = `/tmp/mail-${Date.now()}.eml`;
  await writeFile(file, mail.message);

  exec(`open ${file}`, (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
    }
  });
};

const sendMail = async (to, subject, body) => {
  const result = await transporter.sendMail({
    from: '"Inkskill" <support@inkskill.com>',
    to,
    subject,
    html: body
  });

  if (isDev) await debugMail(result);

  return result;
};

const sendTemplate = async (to, subject, options) => {
  if (!baseTemplate) {
    baseTemplate = await readFile(baseTemplatePath, 'utf8');
    handlebars.registerPartial('mail', baseTemplate);
  }

  const tplPath = path.resolve(templatesDir, options.name + '.hbs');
  const tplContent = await readFile(tplPath);
  const template = handlebars.compile(tplContent.toString());
  const variables = Object.assign({}, options.variables, {
    siteUrl: process.env.SITE_URL,
    year: new Date().getFullYear()
  });

  return await sendMail(to, subject, template(variables));
};

module.exports = {
  sendMail,
  sendTemplate,
};
