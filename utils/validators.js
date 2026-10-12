
const { COUNTRIES, PAYMENT_METHODS } = require('./constants');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const COLOR_RE = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|[a-zA-Z]{3,20})$/;

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

function validateRegister(body) {
  const data = {
    fullname: clean(body.fullname),
    email: clean(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = [];
  if (data.fullname.length < 3) errors.push('Full name must be at least 3 characters');
  if (data.fullname.length > 60) errors.push('Full name cannot be more than 60 characters');
  if (!EMAIL_RE.test(data.email)) errors.push('Please enter a valid email address');
  if (data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (data.password.length > 72) errors.push('Password cannot be more than 72 characters');
  return { data, errors };
}

function validateLogin(body) {
  const data = {
    email: clean(body.email).toLowerCase(),
    password: typeof body.password === 'string' ? body.password : '',
  };
  const errors = [];
  if (!EMAIL_RE.test(data.email)) errors.push('input correct email address');
  if (!data.password) errors.push('input password');
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

  if (data.name.length < 2 || data.name.length > 80) errors.push('Product name must be 2 to 80 characters');
  if (!Number.isFinite(data.price) || data.price < 0) errors.push('Price must be a valid number (0 or more)');
  if (!Number.isFinite(data.discount) || data.discount < 0) errors.push('Discount must be a valid number (0 or more)');
  if (Number.isFinite(data.price) && Number.isFinite(data.discount) && data.discount > data.price) {
    errors.push('Discount cannot be more than the price');
  }
  if (!Number.isInteger(data.stock) || data.stock < 0) errors.push('Stock must be a whole number (0 or more)');

  ['bgcolor', 'panelcolor', 'textcolor'].forEach((key) => {
    if (!COLOR_RE.test(data[key])) errors.push(`${key} is not a valid color (e.g. #f5e6d3 or white)`);
  });

  return { data, errors };
}

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
    if (address.line.length < 5) errors.push('Please enter your full address (house no., street, area)');
    if (address.line.length > 200) errors.push('Address cannot be more than 200 characters');
  }
  if (required || address.city) {
    if (address.city.length < 2 || address.city.length > 60) errors.push('Please enter your city');
  }
  if (address.postalCode && !POSTAL_RE.test(address.postalCode)) errors.push('Postal code is not valid');
  if (!COUNTRIES.includes(address.country)) errors.push('Please choose a country from the list');

  return address;
}

function validateProfile(body) {
  const errors = [];
  const data = {
    fullname: clean(body.fullname),
    email: clean(body.email).toLowerCase(),
    contact: clean(body.contact),
  };

  if (data.fullname.length < 3 || data.fullname.length > 60) errors.push('Name must be 3 to 60 characters');
  if (!EMAIL_RE.test(data.email)) errors.push('Please enter a valid email address');
  if (data.contact && !PHONE_RE.test(data.contact)) errors.push('Please enter a valid contact number (e.g. 03001234567)');
  data.address = validateAddressFields(body, errors, { required: false });

  return { data, errors };
}

function validateCheckout(body) {
  const errors = [];
  const contact = {
    fullname: clean(body.fullname),
    phone: clean(body.phone),
  };

  if (contact.fullname.length < 3 || contact.fullname.length > 60) errors.push("Please enter the receiver's name");
  if (!PHONE_RE.test(contact.phone)) errors.push('Please enter a valid contact number (e.g. 03001234567)');
  const address = validateAddressFields(body, errors, { required: true });

  const paymentMethod = clean(body.paymentMethod);
  if (!Object.keys(PAYMENT_METHODS).includes(paymentMethod)) errors.push('Please choose a payment method');

  return {
    data: { ...contact, ...address, paymentMethod, saveAddress: body.saveAddress === 'on' },
    errors,
  };
}

module.exports = { validateRegister, validateLogin, validateProduct, validateProfile, validateCheckout };