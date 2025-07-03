export interface Currency {
  id: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
}

export interface ExchangeRate {
  id: string;
  household_id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  rate_type: "oficial" | "blue" | "mep" | "ccl" | "cripto" | "manual";
  valid_from: string;
  is_active: boolean;
  notes?: string;
  currencies?: {
    from: Currency;
    to: Currency;
  };
}

export interface HouseholdCurrency {
  id: string;
  household_id: string;
  currency_id: string;
  is_primary: boolean;
  display_order: number;
  currency?: Currency;
}
