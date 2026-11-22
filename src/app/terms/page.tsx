import type { Metadata } from "next";
import StoreShell from "@/components/StoreShell";
import { LegalDoc, LegalShell } from "@/components/LegalDoc";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "شروط الاستخدام" };

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <StoreShell>
      <LegalShell title="شروط الاستخدام" updated={s.legalUpdated}>
        <LegalDoc text={s.legalTerms} />
      </LegalShell>
    </StoreShell>
  );
}
