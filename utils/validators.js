// Form data validation (register, login, product, profile, checkout)
const { COUNTRIES, PAYMENT_METHODS } = require('./constants');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Sirf safe color values: #abc, #aabbcc ya simple naam jaise "white", "black"
const COLOR_RE = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|[a-zA-Z]{3,20})$/;

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

function validateRegister(body) {
  const data = {
    fullname: clean(body.fullname),
    email: clean(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = [];
  if (data.fullname.length < 3) errors.push('Full name kam az kam 3 characters ka hona chahiye');
  if (data.fullname.length > 60) errors.push('Full name 60 characters se zyada nahi ho sakta');
  if (!EMAIL_RE.test(data.email)) errors.push('Sahi email address likhein');
  if (data.password.length < 6) errors.push('Password kam az kam 6 characters ka hona chahiye');
  if (data.password.length > 72) errors.push('Password 72 characters se zyada nahi ho sakta');
  return { data, errors };
}

function validateLogin(body) {
  const data = {
    email: clean(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = [];
  if (!EMAIL_RE.test(data.email)) errors.push('Sahi email address likhein');
  if (!data.password) errors.push('Password likhein');
  return { data, errors };
}

function toNumber(value, fallback) {
  const v = clean(String(value ?? ''));
  if (v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function validateProduct(body) {
  const data = {
    name: clean(body.name),
    price: toNumber(body.price, NaN),
    discount: toNumber(body.discount, 0),
    stock: toNumber(body.stock, 10),
    bgcolor: clean(body.bgcolor) || '#f4f4f5',
    panelcolor: clean(body.panelcolor) || '#e4e4e7',
    textcolor: clean(body.textcolor) || '#18181b',
  };
  const errors = [];

  if (data.name.length < 2 || data.name.length > 80) errors.push('Product name 2 se 80 characters ka hona chahiye');
  if (!Number.isFinite(data.price) || data.price < 0) errors.push('Price sahi number hona chahiye (0 ya zyada)');
  if (!Number.isFinite(data.discount) || data.discount < 0) errors.push('Discount sahi number hona chahiye (0 ya zyada)');
  if (Number.isFinite(data.price) && Number.isFinite(data.discount) && data.discount > data.price) {
    errors.push('Discount price se zyada nahi ho sakta');
  }
  if (!Number.isInteger(data.stock) || data.stock < 0) errors.push('Stock 0 ya us se zyada poora number hona chahiye');

  ['bgcolor', 'panelcolor', 'textcolor'].forEach((key) => {
    if (!COLOR_RE.test(data[key])) errors.push(`${key} sahi color nahi hai (jaise #f5e6d3 ya white)`);
  });

  return { data, errors };
}

// Pakistani aur international dono numbers: 03001234567, +92 300 1234567
const PHONE_RE = /^\+?[0-9][0-9\s-]{8,16}[0-9]$/;
const POSTAL_RE = /^[A-Za-z0-9\s-]{3,12}$/;

function validateAddressFields(body, errors, { required }) {
  const address = {
    line: clean(body.line),
    city: clean(body.city),
    postalCode: clean(body.postalCode),
    country: clean(body.country) || 'Pakistan',
  };

  if (required || address.line) {
    if (address.line.length < 5) errors.push('Poora address likhein (ghar no., street, area)');
    if (address.line.length > 200) errors.push('Address 200 characters se zyada nahi ho sakta');
  }
  if (required || address.city) {
    if (address.city.length < 2 || address.city.length > 60) errors.push('City ka naam likhein');
  }
  if (address.postalCode && !POSTAL_RE.test(address.postalCode)) errors.push('Postal code sahi nahi hai');
  if (!COUNTRIES.includes(address.country)) errors.push('List me se country chunein');

  return address;
}

function validateProfile(body) {
  const errors = [];
  const data = {
    fullname: clean(body.fullname),
    email: clean(body.email).toLowerCase(),
    contact: clean(body.contact),
  };

  if (data.fullname.length < 3 || data.fullname.length > 60) errors.push('Naam 3 se 60 characters ka hona chahiye');
  if (!EMAIL_RE.test(data.email)) errors.push('Sahi email address likhein');
  if (data.contact && !PHONE_RE.test(data.contact)) errors.push('Contact number sahi likhein (jaise 03001234567)');
  data.address = validateAddressFields(body, errors, { required: false });

  return { data, errors };
}

function validateCheckout(body) {
  const errors = [];
  const contact = {
    fullname: clean(body.fullname),
    phone: clean(body.phone),
  };

  if (contact.fullname.length < 3 || contact.fullname.length > 60) errors.push('Receiver ka naam likhein');
  if (!PHONE_RE.test(contact.phone)) errors.push('Contact number sahi likhein (jaise 03001234567)');
  const address = validateAddressFields(body, errors, { required: true });

  const paymentMethod = clean(body.paymentMethod);
  if (!Object.keys(PAYMENT_METHODS).includes(paymentMethod)) errors.push('Payment method chunein');

  return {
    data: { ...contact, ...address, paymentMethod, saveAddress: body.saveAddress === 'on' },
    errors,
  };
}

module.exports = { validateRegister, validateLogin, validateProduct, validateProfile, validateCheckout };
