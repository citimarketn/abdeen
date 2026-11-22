import type { Metadata } from "next";
import StoreShell from "@/components/StoreShell";
import { LegalDoc, LegalShell } from "@/components/LegalDoc";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "سياسة الخصوصية" };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <StoreShell>
      <LegalShell title="سياسة الخصوصية" updated={s.legalUpdated}>
        <LegalDoc text={s.legalPrivacy} />
      </LegalShell>
    </StoreShell>
  );
}
