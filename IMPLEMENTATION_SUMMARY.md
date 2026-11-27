# Role-Based Team Auth & Order Inbox Claim Workflow - Implementation Summary

## Overview
Implemented a complete role-based team authentication system with order inbox claim workflow, dynamic staff WhatsApp routing, and customer order-assignee tracking.

## Files Modified/Created

### 1. Database Schema (`src/db/schema.ts`)
- Added `claimedAt`, `releasedAt`, `releaseReason` fields to `orders` table for audit trail

### 2. Order Management (`src/lib/store.ts`)
- **Modified `createOrder()`**: Orders now start unclaimed in team inbox with owner's WhatsApp for initial notification
- **Added `claimOrder()`**: Atomic claim with race condition prevention using `WHERE assignedToStaffId IS NULL`
- **Added `releaseOrder()`**: Release order back to team inbox, resets to owner's WhatsApp, logs handoff

### 3. New API Routes
- **`/api/staff/claim`** (`src/app/api/staff/claim/route.ts`): Claim an order atomically
- **`/api/staff/release`** (`src/app/api/staff/release/route.ts`): Release order back to inbox with reason

### 4. Enhanced API Routes
- **`/api/staff/inbox`** (`src/app/api/staff/inbox/route.ts`): Now shows unclaimed orders + orders assigned to current staff (excludes other staff's orders)
- **`/api/staff/transfer`** (`src/app/api/staff/transfer/route.ts`): Already existed, updates waNumber to new assignee's WhatsApp
- **`/api/config`** (`src/app/api/config/route.ts`): Returns all on-duty staff + storeWa (owner's fixed WhatsApp)

### 5. Staff UI (`src/app/staff/view.tsx`)
- **Added "Claim" button** for unclaimed orders (only visible when staff is on-duty)
- **Added "Release" button** for orders claimed by current staff
- **Visual indicators**: 
  - Unclaimed orders: navy border, "غير مستلم — صندوق الوارد" badge
  - My orders: green border, "مستلم من قبلك" badge
  - Other's orders: gray border, "مستلم: [name]" badge
- **Transfer dropdown** only shows for orders claimed by current staff

### 6. Customer Order Page (`src/app/order/[orderNo]/page.tsx`)
- **Assigned staff card**: Shows assigned staff name with direct WhatsApp link using their personal WhatsApp
- **Fallback**: If unclaimed, shows store/owner WhatsApp with "Team Inbox" message
- **Pre-filled WhatsApp message** with full order details

### 7. SmartAssistant (`src/components/SmartAssistant.tsx`)
- Uses `storeWa` (owner's fixed WhatsApp) for AI assistant/general store contact
- Shows all on-duty staff names in status

### 8. Admin Staff Team Panel (`src/app/admin/panels/StaffTeam.tsx`)
- Already had: onDuty, dutyRequested, whatsapp, role management (field/manager)
- Owner controls: activate/deactivate staff, approve duty requests, assign WhatsApp numbers

## Security & Race Condition Handling

### Atomic Claim (Double-Claim Prevention)
```typescript
// In claimOrder() - uses WHERE clause for atomic check
.where(and(eq(orders.id, orderId), isNull(orders.assignedToStaffId)))
```
Only updates if `assignedToStaffId` is NULL at the moment of update. If two staff click simultaneously, only one succeeds.

### Authorization Checks
- All staff APIs verify: valid customer session → matching active staff record
- Owner-only APIs for team management (StaffTeam, Team panels)
- Transfer/Release/Claim only allowed for authenticated on-duty staff

### Environment Secrets Preserved
- Owner email/password/codes in `process.env` / settings table
- Never exposed in client UI
- Admin auth uses 3 security codes + password

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Owner** | Full team management, all admin panels, security codes |
| **Supervisor/Admin** | Assigned permissions (orders, products, reviews, etc.) |
| **Field Team** | Inbox access, claim/release/transfer orders, duty management |
| **Manager** | Field permissions + specific admin permissions |
| **Customer** | Order tracking, account management |

## Order Flow

1. **Customer places order** → Creates order with `status: "new"`, `assignedToStaffId: null`, `waNumber: ownerWa`
2. **Order appears in Team Inbox** → Visible to all on-duty staff
3. **Staff claims order** → Atomic update sets `assignedToStaffId`, `assignedToName`, `waNumber: staff.whatsapp`, `claimedAt`
4. **Customer sees assigned staff** → Order page shows staff name + their personal WhatsApp link
5. **Staff can**: 
   - Release back to inbox (with reason)
   - Transfer to another on-duty teammate
   - Update order status via admin panel
6. **Handoff logged** in `orderHandoffs` table for audit trail

## Edge Cases Handled

1. **Race condition on claim**: Atomic WHERE clause prevents double-claiming
2. **Staff off-duty with claimed orders**: Orders stay assigned until released/transferred
3. **Customer views before claim**: Shows store/owner WhatsApp
4. **Transfer to another staff**: Updates `waNumber` to new assignee's WhatsApp
5. **Release**: Resets to owner WhatsApp, logs handoff to "Team Inbox"
6. **Staff deleted/deactivated**: Admin panel prevents deletion if orders assigned (would need cleanup)
7. **Non-on-duty staff can't claim**: Claim button only shows when `me.onDuty === true`

## TypeScript Verification
- ✅ `npx tsc --noEmit` passes with no errors
- ✅ Next.js build compiles successfully (TypeScript step passes)
- Only build failure is missing `DATABASE_URL` for static generation (expected)

## Testing Checklist
- [ ] Owner can add/edit/deactivate staff with WhatsApp numbers
- [ ] Owner can approve/deny duty requests
- [ ] Staff can request/end duty
- [ ] On-duty staff see unclaimed orders in inbox
- [ ] Claim button works and prevents double-claim
- [ ] Claimed order shows staff's WhatsApp on customer page
- [ ] Release returns order to inbox with owner WhatsApp
- [ ] Transfer moves order to another staff with their WhatsApp
- [ ] AI Assistant uses owner's fixed WhatsApp
- [ ] Admin panels properly restrict by role/permissions