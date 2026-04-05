export interface Bank {
  bankMasterId: string;
  bankCode: string;
  bankName: string;
  bankAccountNo: string;
  achNo: string;
  swiftNo: string;
  iban?: string;
  routingNumber?: string;
  accountTypeID?: string;
  accountTypeName?: string;
  paymentMethodID?: string;
  paymentMethodName?: string;
  bankRegionID?: string;
  bankRegion: string;
  bankCountryID?: string;
  bankCountry?: string;
  accountCurrencyID?: string;
  accountCcy: string;
  countryStateMasterId?: string;
  stateName?: string;
  stateCityMasterId?: string;
  cityName?: string;
  zipCode?: string;
  address?: string;
  contactPersonName?: string;
  contactPerson?: string;
  contactPhoneNo?: string;
  contactNo?: string;
  contactEmailId?: string;
  emailId?: string;
  emailId2?: string;
}

export interface BankCascadeIds {
  regionId: string | null;
  countryId: string | null;
  currencyId: string | null;
  countryStateMasterId: string | null;
  stateCityMasterId: string | null;
}
