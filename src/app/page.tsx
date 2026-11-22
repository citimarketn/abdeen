import StoreShell from "@/components/StoreShell";
import AccountView from "./view";

export const dynamic = "force-dynamic";

export default function AccountPage() {
  return (
    <StoreShell>
      <AccountView />
    </StoreShell>
  );
}
