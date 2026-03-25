"use client";

import type { Route } from "next";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildContactsHref(pathname: string, companyPrefix: string, personPrefix: string): Route {
  const params = new URLSearchParams();

  if (companyPrefix) {
    params.set("company", companyPrefix);
  }

  if (personPrefix) {
    params.set("person", personPrefix);
  }

  const queryString = params.toString();
  return (queryString ? `${pathname}?${queryString}` : pathname) as Route;
}

export function ContactsControls({
  companyPrefix,
  personPrefix
}: {
  companyPrefix: string;
  personPrefix: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState(companyPrefix);
  const [person, setPerson] = useState(personPrefix);

  useEffect(() => {
    setCompany(companyPrefix);
  }, [companyPrefix]);

  useEffect(() => {
    setPerson(personPrefix);
  }, [personPrefix]);

  useEffect(() => {
    const nextHref = buildContactsHref(pathname, company.trim(), person.trim());
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("sortField");
    currentParams.delete("sortDirection");
    currentParams.delete("page");
    const currentQueryString = currentParams.toString();
    const currentHref = (currentQueryString ? `${pathname}?${currentQueryString}` : pathname) as Route;

    if (nextHref === currentHref) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(nextHref, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [company, pathname, person, router, searchParams]);

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      <input
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        placeholder="Filtrar por empresa"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
      />
      <input
        value={person}
        onChange={(event) => setPerson(event.target.value)}
        placeholder="Filtrar por persona"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal"
      />
    </div>
  );
}
