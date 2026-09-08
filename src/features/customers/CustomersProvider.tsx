import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Customer } from "../../types";
import { MOCK_CUSTOMERS } from "../../mocks/generator";
import {
  CustomersContext,
  type NewCustomerInput,
} from "./customersContext";

const CUSTOMERS_KEY = "queuedesk_customers";

function loadCustomers(): Customer[] {
  let saved: Customer[] = [];
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (raw) saved = JSON.parse(raw) as Customer[];
  } catch {
    saved = [];
  }
  const byId = new Map<string, Customer>();
  [...MOCK_CUSTOMERS, ...saved].forEach((c) => byId.set(c.id, c));
  return [...byId.values()];
}

function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch {
    /* quota exceeded */
  }
}

export const CustomersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  const createCustomer = useCallback(
    (input: NewCustomerInput): Customer => {
      const email = input.email.trim().toLowerCase();
      const existing = customers.find(
        (c) => c.email.toLowerCase() === email,
      );
      if (existing) return existing;

      const maxIdNum = customers.reduce((max, c) => {
        const num = parseInt(c.id.replace("customer-", ""), 10);
        return Number.isFinite(num) && num > max ? num : max;
      }, 0);

      const newCustomer: Customer = {
        id: `customer-${maxIdNum + 1}`,
        name: input.name.trim(),
        email: input.email.trim(),
        company: input.company?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        plan: input.plan,
        createdAt: new Date().toISOString(),
      };

      setCustomers((prev) =>
        prev.some((c) => c.id === newCustomer.id) ? prev : [...prev, newCustomer],
      );
      return newCustomer;
    },
    [customers],
  );

  const getCustomerById = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers],
  );

  const value = useMemo(
    () => ({ customers, createCustomer, getCustomerById }),
    [customers, createCustomer, getCustomerById],
  );

  return (
    <CustomersContext.Provider value={value}>
      {children}
    </CustomersContext.Provider>
  );
};