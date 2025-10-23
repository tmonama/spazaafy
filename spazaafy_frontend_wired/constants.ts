
export const REQUIRED_DOCS = [
    'Business Registration Certificate',
    'Certificate of Acceptability (Health)',
    'Tax / SARS Documents',
    'Certified ID/Passport/Permit',
    'Business Licence / Trading Permit',
    'Fire Safety Certificate',
    'Proof of Property Ownership/Lease',
    'Bank Confirmation Letter',
    'Other Supporting Documents',
];

export const NAME_TO_TYPE: Record<string, string> = {
  'Business Registration Certificate': 'COR_REG',
  'Certificate of Acceptability (Health)': 'COA',
  'Tax / SARS Documents': 'TAX',
  'Business Licence / Trading Permit': 'BUSINESS_LICENCE',
  'Fire Safety Certificate': 'FIRE_SAFETY',
  'Other Supporting Documents': 'OTHER',
  'Certified ID/Passport/Permit': 'ID_PERMIT',
  'Proof of Property Ownership/Lease': 'PROOF_OF_PROPERTY',
  'Bank Confirmation Letter': 'BANK_LETTER',
};