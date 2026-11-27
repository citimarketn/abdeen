# Role-Based Team Auth & Order Inbox Claim Workflow - Implementation Plan

## Files to Modify

### 1. Database Schema Changes (`src/db/schema.ts`)
- Add `claimedAt` timestamp to orders table
- Add `claimToken` for optimistic locking (optional, for race condition prevention)
- Add `releasedAt` and `releaseReason` for audit trail

### 2. Store/Order Creation (`src/lib/store.ts`)
- Modify `createOrder()` to NOT auto-assign immediately
- Orders start as `status: "new"` with `assignedToStaffId: null`, `assignedToName: null`, `waNumber: ownerWa` (for initial notification)
- Add `claimOrder()` function for atomic claim with race condition prevention

### 3. Staff Inbox API (`src/app/api/staff/inbox/route.ts`)
- Filter orders: show unclaimed orders + orders claimed by me + orders assigned to me
- Add `claimable: boolean` flag for each order

### 4. Staff Claim API (New: `src/app/api/staff/claim/route.ts`)
- Atomic claim with transaction/optimistic lock
- Prevent double-claiming
- Set `claimedAt`, `assignedToStaffId`, `assignedToName`, `waNumber` (staff's WhatsApp)

### 5. Staff Release API (New: `src/app/api/staff/release/route.ts`)
- Release order back to inbox
- Reset `assignedToStaffId`, `assignedToName`, `waNumber` to owner's
- Log in `orderHandoffs`

### 4. Staff Transfer API (`src/app/api/staff/transfer/route.ts`) - Enhance
- Already exists, ensure it updates `waNumber` to new assignee's WhatsApp

### 5. Staff View UI (`src/app/staff/view.tsx`)
- Add "Claim" button for unclaimed orders
- Add "Release" button for claimed orders
- Show clear visual distinction: unclaimed (team inbox), mine (claimed), assigned to others

### 6. Customer Order Page (`src/app/order/[orderNo]/page.tsx`)
- Show assigned staff member's name, role, and their personal WhatsApp link
- If unclaimed, show owner/store WhatsApp

### 7. Config API (`src/app/api/config/route.ts`) - Enhance
- Return on-duty staff for AI assistant routing
- Keep owner's WhatsApp for main store contact

### 8. SmartAssistant Component (`src/components/SmartAssistant.tsx`)
- Use on-duty staff WhatsApp when available, fallback to owner

### 9. Admin Staff Team Panel (`src/app/admin/panels/StaffTeam.tsx`) - Minor
- Already has onDuty, dutyRequested, whatsapp, role management

## Edge Cases to Handle
1. **Race conditions**: Two staff click claim simultaneously → use DB transaction with WHERE clause checking `assignedToStaffId IS NULL`
2. **Staff goes off-duty while having claimed orders**: Orders stay with them until released/transferred
3. **Customer views order before claim**: Show store/owner WhatsApp
4. **Order transferred**: Update waNumber to new assignee's WhatsApp
5. **Order released**: Reset to owner WhatsApp, show in team inbox again
6. **Staff deleted/deactivated**: Reassign their claimed orders to owner/inbox

## TypeScript/Build Verification
- Run `npm run build` or `tsc --noEmit` after changes
- Ensure all new APIs have proper types