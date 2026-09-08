import { createContext } from "react";
import type { Customer, CustomerPlan } from "../../types";

export interface NewCustomerInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  plan: CustomerPlan;
}

export interface CustomersContextType {
  customers: Customer[];
  createCustomer: (input: NewCustomerInput) => Customer;
  getCustomerById: (id: string) => Customer | undefined;
}

export const CustomersContext = createContext<CustomersContextType | undefined>(
  undefined,
);