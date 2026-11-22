import StoreShell from "@/components/StoreShell";
import StaffView from "./view";

export const dynamic = "force-dynamic";

export default function StaffPage() {
  return (
    <StoreShell>
      <StaffView />
    </StoreShell>
  );
}
