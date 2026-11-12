const optionPrices = {
  WALLBOX: { annual: 4800, monthly: 440 },
  CABLE: { annual: 2400, monthly: 220 },
  BATTERY: { annual: 9600, monthly: 880 },
  STRANDED: { annual: 3600, monthly: 330 },
  GLASS: { annual: 6000, monthly: 550 },
};

const packageDefinitions = [
  { id: "essential", price: { annual: 42000, monthly: 3850 }, included: [] },
  { id: "comfort", price: { annual: 61200, monthly: 5610 }, included: ["CABLE", "STRANDED"] },
  { id: "integral", price: { annual: 86400, monthly: 7920 }, included: ["WALLBOX", "CABLE", "STRANDED", "GLASS"] },
];

const quoteTemplate = {
  quote_id: "qt_7f3a91c2",
  currency: "EUR",
  expires_at: "2027-05-21T10:00:00Z",
  packages: packageDefinitions.map(pkg => ({
    id: pkg.id,
    price: pkg.price,
    options: Object.keys(optionPrices).map(code => ({
      code,
      included: pkg.included.includes(code),
      price: pkg.included.includes(code) ? { annual: 0, monthly: 0 } : optionPrices[code],
    })),
  })),
};

const quoteContext = new Map();
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const shiftDate = (value, days) => { const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); };
const invalid = code => { const error = new Error(code); error.code = code; return error; };
const isDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime());
const ageAtLeast = (birthDate, years) => { const birth = new Date(`${birthDate}T12:00:00Z`); const today = new Date(); const age = today.getUTCFullYear() - birth.getUTCFullYear() - ((today.getUTCMonth() < birth.getUTCMonth() || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())) ? 1 : 0); return age >= years; };

export async function createQuote(input) {
  await wait(500);
  const vehicle = input.vehicle || {};
  const driver = input.driver || {};
  const validModel = ["i4", "i5", "i7", "iX1", "iX2", "iX3"].includes(vehicle.model_code);
  const validDriverValues = ["garage", "driveway", "street"].includes(driver.parking) && ["home", "work", "public"].includes(driver.charging);
  if (!validModel || !Number.isInteger(vehicle.list_price) || !isDate(vehicle.delivery_date) || new Date(`${vehicle.delivery_date}T12:00:00Z`) <= new Date() || !isDate(driver.birth_date) || !isDate(driver.licence_since) || !Number.isInteger(driver.claims_3y) || !Number.isInteger(driver.annual_km) || !/^\d{5}$/.test(driver.postcode) || !validDriverValues) throw invalid("invalid_request");
  const licenceYears = (Date.now() - new Date(`${driver.licence_since}T12:00:00Z`).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (!ageAtLeast(driver.birth_date, 18) || driver.claims_3y >= 3 || licenceYears < 2) throw invalid("driver_ineligible");
  quoteContext.set(quoteTemplate.quote_id, { starts_on: vehicle.delivery_date });
  return structuredClone(quoteTemplate);
}

export async function issueContract(input) {
  await wait(700);
  if (input.quote_id !== quoteTemplate.quote_id || !quoteContext.has(input.quote_id)) throw invalid("quote_not_found");
  if (new Date() > new Date(quoteTemplate.expires_at)) throw invalid("quote_expired");
  if (!Object.values(input.consents || {}).every(Boolean)) throw invalid("consent_required");
  const pkg = packageDefinitions.find(item => item.id === input.package_id);
  if (!pkg || !["annual", "monthly"].includes(input.frequency) || !input.holder?.first_name || !input.holder?.last_name || !input.holder?.email || !input.holder?.phone) throw invalid("invalid_request");
  const options = input.options || [];
  if (options.some(code => !optionPrices[code]) || options.some(code => pkg.included.includes(code))) throw invalid("invalid_request");
  const annualExtra = options.reduce((sum, code) => sum + optionPrices[code].annual, 0);
  const monthlyExtra = options.reduce((sum, code) => sum + optionPrices[code].monthly, 0);
  const premium = input.frequency === "monthly" ? pkg.price.monthly + monthlyExtra : pkg.price.annual + annualExtra;
  const startsOn = quoteContext.get(input.quote_id).starts_on;
  return { contract_id: "ctr_8d41b06f", policy_number: "ARD-FR-2026-0481233", status: "issued", starts_on: startsOn, ends_on: shiftDate(startsOn, 364), premium: { annual: pkg.price.annual + annualExtra, monthly: pkg.price.monthly + monthlyExtra, frequency: input.frequency }, payment: { method: "atm_reference", entity: "21456", reference: "907318442", amount: premium, due_by: shiftDate(startsOn, -3) } };
}
