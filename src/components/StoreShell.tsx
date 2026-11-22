import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SmartAssistant from "./SmartAssistant";
import { getCategories, getSettings } from "@/lib/store";

export default async function StoreShell({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getCategories(),
  ]);
  return (
    <div className="relative flex min-h-screen flex-col">
      {settings.siteBg && (
        <div className="pointer-events-none fixed inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.siteBg}
            alt=""
            className="h-full w-full object-cover opacity-[0.07]"
          />
        </div>
      )}
      <Header
        settings={settings}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
      <main className="flex-1">{children}</main>
      <Footer
        settings={settings}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
      <SmartAssistant whatsapp={settings.whatsapp} />
    </div>
  );
}
