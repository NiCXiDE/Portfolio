import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Home — ${SITE_NAME}`,
  description: "Diseñador gráfico y de interfaces. Portfolio de Nico Ayala.",
};

export default function RootRedirect() {
  redirect(`/${defaultLocale}`);
}
