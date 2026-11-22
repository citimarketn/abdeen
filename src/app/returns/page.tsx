import type { Metadata } from "next";
import StoreShell from "@/components/StoreShell";
import { LegalDoc, LegalShell } from "@/components/LegalDoc";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "سياسة الاسترجاع" };

export default async function ReturnsPage() {
  const s = await getSettings();
  return (
    <StoreShell>
      <LegalShell title="سياسة الاسترجاع والاستبدال" updated={s.legalUpdated}>
        <LegalDoc text={s.legalReturns} />
      </LegalShell>
    </StoreShell>
  );
}
