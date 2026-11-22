import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { I18nProvider } from "@/lib/i18n";
import { AccountProvider } from "@/components/AccountProvider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  weight: ["300", "400", "500", "700", "800"],
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "عابدين | تسوّق وكأّنت على الأرض",
    template: "%s | عابدين",
  },
  description:
    "متجر عابدين الإلكتروني — أزياء نساء ورجال، عطور، إلكترونيات، منزل وجمال. توصيل لجميع المحافظات والدفع عند الاستلام.",
  icons: {
    icon: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16337e",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem('abdeen-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-cream font-sans text-ink">
        <I18nProvider>
          <AccountProvider>
            <CartProvider>{children}</CartProvider>
          </AccountProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
