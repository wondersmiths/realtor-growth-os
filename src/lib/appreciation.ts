import { Contact } from "./types";

interface AppreciationResult {
  triggered: boolean;
  appreciationPercent?: number;
}

export function checkAppreciation(contact: Contact): AppreciationResult {
  if (!contact.purchase_year || !contact.estimated_property_value || !contact.original_purchase_price) {
    return { triggered: false };
  }

  if (contact.original_purchase_price <= 0) {
    return { triggered: false };
  }

  if (contact.appreciation_triggered) {
    return { triggered: false }; // Already triggered
  }

  const appreciation =
    (contact.estimated_property_value - contact.original_purchase_price) /
    contact.original_purchase_price;

  if (appreciation >= 0.2) {
    return { triggered: true, appreciationPercent: Math.round(appreciation * 100) };
  }

  return { triggered: false };
}
