import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Nicolas Ayala — Portfolio",
  description: "Diseñador gráfico y de interfaces.",
};

export default function RootRedirect() {
  redirect(`/${defaultLocale}`);
}
