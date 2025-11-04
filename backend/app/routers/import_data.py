from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Staff, WorkerAdvance, TeaPlucking, Factory
from datetime import datetime
import pandas as pd
from io import BytesIO

router = APIRouter()

@router.post("/excel")
async def import_excel_data(
    file: UploadFile = File(...),
    month: int = 11,
    year: int = 2024,
    session: Session = Depends(get_session)
):
    """
    Import worker data from Excel file
    Expects Excel with sheets containing:
    - Worker names in column A
    - Daily quantities in date columns
    - ADV rows for advances
    - Factory totals at bottom
    """
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(400, "File must be an Excel file (.xlsx or .xls)")
    
    try:
        # Read Excel file
        contents = await file.read()
        excel_file = BytesIO(contents)
        
        # Read all sheets
        xls = pd.ExcelFile(excel_file)
        
        imported_workers = []
        imported_advances = []
        imported_tea_records = []
        errors = []
        
        # Get factory mapping (you can adjust based on sheet name or data)
        factories = session.exec(select(Factory)).all()
        factory_map = {f.name.upper(): f for f in factories}
        
        # Default to first active factory if available
        default_factory = next((f for f in factories if f.active), None)
        
        # Process first sheet (or you can specify which sheet)
        sheet_name = xls.sheet_names[0]
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
        
        # Extract worker names and data
        worker_data = {}
        current_worker = None
        
        for idx, row in df.iterrows():
            first_cell = str(row[0]).strip() if pd.notna(row[0]) else ""
            
            # Skip empty rows and totals
            if not first_cell or first_cell.upper() in ['TOTALS', 'TOTAL', 'DATE', 'KGS', 'GROSS', 'NET']:
                continue
            
            # Check if this is a worker name row (not DWD or ADV)
            if first_cell.upper() not in ['DWD', 'ADV', 'SUP.  VICTOR']:
                current_worker = first_cell
                if current_worker not in worker_data:
                    worker_data[current_worker] = {
                        'daily_quantities': [],
                        'advances': []
                    }
                
                # Extract daily quantities (skip first column which is name)
                for col_idx in range(1, min(32, len(row))):  # Days 1-31
                    value = row[col_idx]
                    if pd.notna(value) and str(value).strip() and value != 0:
                        try:
                            qty = float(value)
                            if qty > 0:
                                worker_data[current_worker]['daily_quantities'].append({
                                    'day': col_idx,
                                    'quantity': qty
                                })
                        except (ValueError, TypeError):
                            pass
            
            # Check if this is an ADV row
            elif first_cell.upper() == 'ADV' and current_worker:
                # Extract advances
                for col_idx in range(1, min(32, len(row))):
                    value = row[col_idx]
                    if pd.notna(value) and str(value).strip() and value != 0:
                        try:
                            adv_amount = float(value)
                            if adv_amount > 0:
                                worker_data[current_worker]['advances'].append({
                                    'day': col_idx,
                                    'amount': adv_amount
                                })
                        except (ValueError, TypeError):
                            pass
        
        # Create staff records and import data
        for worker_name, data in worker_data.items():
            if worker_name.upper() == 'SUP.  VICTOR':
                continue  # Skip supervisor
            
            # Check if worker already exists
            existing_worker = session.exec(
                select(Staff).where(Staff.name == worker_name)
            ).first()
            
            if not existing_worker:
                # Create new worker
                worker = Staff(
                    name=worker_name,
                    role="Tea Plucker",
                    pay_type="per_kilo",
                    pay_rate=0  # Will be calculated from factory rates
                )
                session.add(worker)
                session.commit()
                session.refresh(worker)
                imported_workers.append(worker.name)
            else:
                worker = existing_worker
            
            # Import advances
            for adv in data['advances']:
                advance_date = datetime(year, month, adv['day'])
                
                advance = WorkerAdvance(
                    worker_id=worker.id,
                    amount=adv['amount'],
                    date=advance_date,
                    month=month,
                    year=year,
                    deducted=False,
                    notes=f"Imported from Excel - {sheet_name}"
                )
                session.add(advance)
                imported_advances.append({
                    'worker': worker.name,
                    'amount': adv['amount'],
                    'day': adv['day']
                })
            
            # Import tea plucking records (using default factory if available)
            if default_factory:
                for daily in data['daily_quantities']:
                    pluck_date = datetime(year, month, daily['day'])
                    
                    # Calculate amounts - farm pays worker KES 8/kg
                    quantity = daily['quantity']
                    worker_rate = 8.0
                    factory_rate = default_factory.rate_per_kg
                    transport_deduction = 3.0
                    
                    worker_payment = quantity * worker_rate
                    factory_gross = quantity * factory_rate
                    factory_net_to_farm = factory_gross - (quantity * transport_deduction)
                    farm_profit = factory_net_to_farm - worker_payment
                    
                    tea_record = TeaPlucking(
                        worker_id=worker.id,
                        factory_id=default_factory.id,
                        quantity=quantity,
                        date=pluck_date,
                        worker_rate=worker_rate,
                        factory_rate=factory_rate,
                        transport_deduction=transport_deduction,
                        worker_payment=worker_payment,
                        factory_gross=factory_gross,
                        factory_net_to_farm=factory_net_to_farm,
                        farm_profit=farm_profit,
                        comment=f"Imported from Excel - {sheet_name}"
                    )
                    session.add(tea_record)
                    imported_tea_records.append({
                        'worker': worker.name,
                        'quantity': quantity,
                        'day': daily['day']
                    })
        
        session.commit()
        
        return {
            "success": True,
            "message": f"Data imported from sheet: {sheet_name}",
            "summary": {
                "workers_created": len(imported_workers),
                "workers_list": imported_workers,
                "advances_imported": len(imported_advances),
                "tea_records_imported": len(imported_tea_records),
                "month": month,
                "year": year,
                "sheet_name": sheet_name
            },
            "errors": errors if errors else None
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error processing Excel file: {str(e)}")

@router.post("/workers-from-excel")
async def import_workers_only(
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """
    Import only worker names from Excel file
    Creates Staff records with pay_type="per_kilo"
    """
    
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(400, "File must be an Excel file (.xlsx or .xls)")
    
    try:
        contents = await file.read()
        excel_file = BytesIO(contents)
        
        # Read first sheet
        df = pd.read_excel(excel_file, sheet_name=0, header=None)
        
        worker_names = set()
        
        # Extract worker names
        for idx, row in df.iterrows():
            first_cell = str(row[0]).strip() if pd.notna(row[0]) else ""
            
            # Skip non-worker rows
            if (not first_cell or 
                first_cell.upper() in ['DWD', 'ADV', 'TOTALS', 'TOTAL', 'DATE', 'KGS', 'GROSS', 'NET', 'SUP.  VICTOR'] or
                first_cell.upper().startswith('KAISUGU') or
                first_cell.upper().startswith('FINLAYS') or
                first_cell.upper().startswith('KTDA') or
                first_cell.upper().startswith('KURESOI') or
                first_cell.upper().startswith('KIPNG')):
                continue
            
            worker_names.add(first_cell)
        
        # Create worker records
        created_workers = []
        existing_workers = []
        
        for name in worker_names:
            # Check if worker exists
            existing = session.exec(
                select(Staff).where(Staff.name == name)
            ).first()
            
            if not existing:
                worker = Staff(
                    name=name,
                    role="Tea Plucker",
                    pay_type="per_kilo",
                    pay_rate=0
                )
                session.add(worker)
                created_workers.append(name)
            else:
                existing_workers.append(name)
        
        session.commit()
        
        return {
            "success": True,
            "workers_created": len(created_workers),
            "workers_existing": len(existing_workers),
            "created_list": sorted(created_workers),
            "existing_list": sorted(existing_workers),
            "total_workers": len(worker_names)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error processing Excel file: {str(e)}")
