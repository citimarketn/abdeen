import StoreShell from "@/components/StoreShell";
import CheckoutForm from "./form";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <StoreShell>
      <CheckoutForm />
    </StoreShell>
  );
}
