# Farm Management System - Redesign Status

## ✅ COMPLETED (Current Session)

### 1. Avocado Farm Module
- ✅ Backend models (`AvocadoHarvest`, `AvocadoSale`)
- ✅ Backend API routes (`backend/app/routers/avocado.py`)
- ✅ Frontend component (`frontend/src/components/Avocado.jsx`)
- ✅ Navigation integration in `App.jsx`
- ✅ Tracks 40+ Hass & Fuerte trees
- ✅ Pricing: Current KES 20/kg, Future KES 35-40/kg

### 2. PDF Export Features
- ✅ Added jsPDF libraries
- ✅ Full monthly payroll PDF export
- ✅ Individual worker salary slip PDF export
- ✅ Professional formatting with farm branding

### 3. Enhanced Dashboard
- ✅ Background images/styling for farm sections
- ✅ Tea plantation section with green gradients
- ✅ Dairy, Avocado, Poultry section cards with unique backgrounds
- ✅ Updated quick actions

### 4. Reports Page
- ✅ Created comprehensive Reports component
- ✅ Multiple report types (Overview, Tea, Fertilizer, Staff, Financial)
- ✅ Date range filtering
- ✅ PDF export functionality
- ✅ Real-time statistics

### 5. ✅ CRITICAL FIX: Models Redesigned
**Old (WRONG) System:**
- Fertilizer was tracked per worker
- Workers paid for fertilizer via salary deductions

**New (CORRECT) System:**
- `WorkerAdvance`: Money advances given to workers (deducted from monthly pay)
- `FertilizerPurchase`: Fertilizer bought from factories @ KES 2,500/bag
- `BonusPayment`: Biannual bonuses from factories (with fertilizer deductions)
- `MonthlyPayroll`: Updated to use advances instead of fertilizer

---

## 🔴 PENDING WORK (Next Steps)

### 1. Backend Routes - Worker Advances
**File:** `backend/app/routers/advances.py` (NEW)
**Endpoints Needed:**
```python
POST   /advances/              # Record advance given to worker
GET    /advances/              # List all advances
GET    /advances/worker/{id}   # Get worker's advances
GET    /advances/month/{m}/{y} # Get month's advances
PUT    /advances/{id}          # Update advance
DELETE /advances/{id}          # Delete advance
```

### 2. Backend Routes - Fertilizer Purchases
**File:** `backend/app/routers/fertilizer.py` (REPLACE CURRENT)
**Endpoints Needed:**
```python
POST   /fertilizer/           # Record fertilizer purchase from factory
GET    /fertilizer/           # List all purchases
GET    /fertilizer/factory/{id} # Get factory's fertilizer sales
GET    /fertilizer/unpaid     # Get unpaid purchases
PUT    /fertilizer/{id}/pay   # Mark as paid
DELETE /fertilizer/{id}       # Delete purchase
```

### 3. Backend Routes - Bonus Payments
**File:** `backend/app/routers/bonus.py` (NEW)
**Endpoints Needed:**
```python
POST   /bonus/                # Record bonus payment
GET    /bonus/                # List all bonuses
GET    /bonus/factory/{id}    # Get factory's bonuses
PUT    /bonus/{id}            # Update bonus
DELETE /bonus/{id}            # Delete bonus
```

### 4. Update Payroll Calculation Logic
**File:** `backend/app/routers/payroll.py` (UPDATE)
**Changes Needed:**
- Remove fertilizer deduction logic
- Add advance deduction logic
- Calculate: `net_pay = gross_earnings - total_advances`
- Update summary endpoint to show advances instead of fertilizer

### 5. Excel Import Feature
**File:** `backend/app/routers/import_data.py` (NEW)
**Functionality:**
- Parse Excel file with 2024 data
- Extract: Workers, Daily quantities, Advances (ADV column), Factory deliveries
- Map to database models
- Bulk insert with validation
- Return import summary

**Endpoint:**
```python
POST /import/excel  # Upload Excel file, parse and import
```

**Excel Structure to Parse:**
```
- Worker names in column A
- Daily quantities in date columns
- "DWD" rows (appear to be daily wage/work days)
- "ADV" rows (advances given)
- Factory delivery totals at bottom
```

### 6. Frontend - Worker Advances Component
**File:** `frontend/src/components/Advances.jsx` (NEW)
**Features:**
- Form to record advance given to worker
- List of all advances (with filters by worker, month, status)
- Mark advances as deducted
- Summary statistics
- PDF export of advances

### 7. Frontend - Update Fertilizer Component
**File:** `frontend/src/components/Fertilizer.jsx` (REPLACE)
**New Features:**
- Record fertilizer purchase from factory
- Select factory, number of bags @ KES 2,500/bag
- Payment method: "Deduct from tea delivery" or "Deduct from bonus"
- List all purchases with payment status
- Mark as paid
- Summary: Total owed to each factory

### 8. Frontend - Bonus Payments Component
**File:** `frontend/src/components/Bonus.jsx` (NEW)
**Features:**
- Record bonus payment received
- Enter period (H1/H2), factory, amount
- Auto-calculate fertilizer deductions
- Show net bonus received
- List all bonus payments
- Export to PDF

### 9. Frontend - Update Payroll Display
**File:** `frontend/src/components/Payroll.jsx` (UPDATE)
**Changes:**
- Replace "Fertilizer Deductions" column with "Advances"
- Update calculation display
- Update info box to explain advances
- Update PDF export to show advances

### 10. Frontend - Excel Import UI
**File:** Add to existing component or create new
**Features:**
- File upload button
- Parse and preview data
- Confirm import
- Show import results/errors

### 11. Register New Routes
**File:** `backend/app/main.py` (UPDATE)
```python
from app.routers import advances, bonus
# Add to includes:
app.include_router(advances.router, prefix="/advances", tags=["Advances"])
app.include_router(bonus.router, prefix="/bonus", tags=["Bonus"])
```

### 12. Update Navigation
**File:** `frontend/src/App.jsx`
- Add "Advances" link
- Add "Bonus Payments" link
- Update "Fertilizer" to new implementation

---

## 📊 Data Migration Strategy

### For Existing Data:
1. **Backup current database** before migration
2. **Run migration script** to:
   - Move `FertilizerTransaction` data to `WorkerAdvance` (if any were actually advances)
   - Delete incorrect fertilizer records
3. **Import 2024 Excel data** using new import feature

### Excel Import Mapping:
```
Worker Name → Staff table
Daily Quantity → TeaPlucking table
ADV amounts → WorkerAdvance table
Factory totals → Aggregate for verification
DWD rows → Parse for work days tracking (if needed)
```

---

## 🧪 Testing Checklist

- [ ] Test advance recording and deduction
- [ ] Test fertilizer purchase from factories
- [ ] Test bonus payment with fertilizer deductions
- [ ] Test updated payroll calculation
- [ ] Test Excel import with sample data
- [ ] Test PDF exports with new data
- [ ] Verify all factory relationships
- [ ] End-to-end test: Record advances → Calculate payroll → Export PDF

---

## 📝 Priority Order

**CRITICAL (Do First):**
1. Update fertilizer router
2. Create advances router
3. Update payroll calculation
4. Update Fertilizer frontend
5. Create Advances frontend
6. Test basic flow

**HIGH PRIORITY:**
7. Create bonus router & frontend
8. Update Payroll frontend display
9. Excel import feature

**MEDIUM PRIORITY:**
10. Enhanced reporting
11. Historical data migration
12. Additional PDF exports

---

## 💡 Notes

- All monetary amounts in KES (Kenyan Shillings)
- Fertilizer: KES 2,500 per bag (fixed price from factories)
- Advances: Variable amounts given to workers during month
- Bonuses: Biannual (twice per year: H1, H2)
- Transport deduction: KES 3 per kg (already implemented correctly)

---

## 🚀 Next Session Action Plan

1. **Start with backend** (routers for advances, updated fertilizer, bonus)
2. **Update payroll logic** (use advances, not fertilizer)
3. **Create/update frontend components**
4. **Test with sample data**
5. **Create Excel import** (can be done later if time-constrained)
6. **Restart Docker backend** after all backend changes
7. **Full system test**
