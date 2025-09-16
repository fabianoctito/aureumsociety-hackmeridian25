# import removido: os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.schemas import WatchCreate, WatchOut, PurchasePayload
from app.auth import require_role
from app.database import get_db
from app.models import Watch, User, Store, Favorite
from uuid import uuid4

router = APIRouter(prefix="/watches", tags=["watches"])

@router.post("/", response_model=WatchOut)
async def create_watch(
    watch: WatchCreate,
    current_user = Depends(require_role(["store"])),
    db: Session = Depends(get_db)
):
    # Strict serial number validation
    if not watch.serial_number or len(watch.serial_number.strip()) < 3:
        raise HTTPException(
            status_code=400, 
            detail="Serial number must have at least 3 characters"
        )
    
    # Check for duplication (case insensitive and trim)
    serial_clean = watch.serial_number.strip().upper()
    existing = db.query(Watch).filter(
        func.upper(func.trim(Watch.serial_number)) == serial_clean
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Serial number '{watch.serial_number}' already registered"
        )
    
    # Find user's store
    store = db.query(Store).filter(Store.user_id == int(current_user["sub"])).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    # Create watch
    db_watch = Watch(
        serial_number=watch.serial_number.strip(),
        brand=watch.brand,
        model=watch.model,
        year=watch.year,
        condition=watch.condition,
        description=watch.description,
        purchase_price_brl=watch.purchase_price_brl,
        current_value_brl=watch.current_value_brl,
        current_owner_user_id=int(current_user["sub"]),
        status="for_sale",
        store_id=store.id
    )
    db.add(db_watch)
    db.commit()
    db.refresh(db_watch)
    return db_watch

@router.get("/marketplace", response_model=List[WatchOut])
def list_marketplace_watches(
    db: Session = Depends(get_db),
    brand: str = None,
    category: str = None,
    condition: str = None,
    price_min: float = None,
    price_max: float = None,
    search: str = None,
    sort_by: str = None
):
    query = db.query(Watch).filter(Watch.status == "for_sale")

    if brand:
        brands = [b.strip().lower() for b in brand.split(',')]
        query = query.filter(func.lower(Watch.brand).in_(brands))
    if category:
        categories = [c.strip().lower() for c in category.split(',')]
        query = query.filter(func.lower(Watch.category).in_(categories))
    if condition:
        conditions = [c.strip().lower() for c in condition.split(',')]
        query = query.filter(func.lower(Watch.condition).in_(conditions))
    if price_min:
        query = query.filter(Watch.current_value_brl >= price_min)
    if price_max:
        query = query.filter(Watch.current_value_brl <= price_max)
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            func.lower(Watch.brand).like(search_term) |
            func.lower(Watch.model).like(search_term) |
            func.lower(Watch.description).like(search_term)
        )

    if sort_by == "price-low":
        query = query.order_by(Watch.current_value_brl.asc())
    elif sort_by == "price-high":
        query = query.order_by(Watch.current_value_brl.desc())
    elif sort_by == "brand":
        query = query.order_by(Watch.brand.asc())
    elif sort_by == "newest":
        query = query.order_by(Watch.created_at.desc())
    # "popular" sorting would require a popularity metric, not implemented here

    return query.all()

@router.post("/{watch_id}/purchase")
def purchase_watch(
    watch_id: int,
    purchase: PurchasePayload,
    current_user = Depends(require_role(["user"])),
    db: Session = Depends(get_db)
):
    # Find watch with join for optimization
    watch = db.query(Watch).filter(
        Watch.id == watch_id, 
        Watch.status == "for_sale"
    ).first()
    
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not available for sale")
    
    current_user_id = int(current_user["sub"])
    
    # Check if not the current owner
    if watch.current_owner_user_id == current_user_id:
        raise HTTPException(
            status_code=400, 
            detail="You cannot buy your own watch"
        )
    
    # Check if not the store owning the watch
    if watch.store_id:
        store = db.query(Store).filter(Store.id == watch.store_id).first()
        if store and store.user_id == current_user_id:
            raise HTTPException(
                status_code=400,
                detail="Store cannot buy watch it is selling"
            )
    
    # Update owner and status
    watch.current_owner_user_id = current_user_id
    watch.status = "sold"
    db.commit()
    db.refresh(watch)
    
    return {"message": "Purchase completed successfully", "watch": watch}

@router.get("/search", response_model=List[WatchOut])
def search_watches(
    q: str,  # Query de busca
    db: Session = Depends(get_db)
):
    """Search watches by text in brand, model or description"""
    search_term = f"%{q.lower()}%"
    
    watches = db.query(Watch).filter(
        Watch.status == "for_sale"
    ).filter(
        func.lower(Watch.brand).like(search_term) |
        func.lower(Watch.model).like(search_term) |
        func.lower(Watch.description).like(search_term) |
        func.lower(Watch.serial_number).like(search_term)
    ).all()
    
    return watches

@router.get("/filter", response_model=List[WatchOut])
def filter_watches(
    brand: str = None,
    model: str = None,
    condition: str = None,
    year_min: int = None,
    year_max: int = None,
    price_min: float = None,
    price_max: float = None,
    db: Session = Depends(get_db)
):
    """Advanced filters for watches"""
    query = db.query(Watch).filter(Watch.status == "for_sale")
    
    if brand:
        query = query.filter(func.lower(Watch.brand).like(f"%{brand.lower()}%"))
    if model:
        query = query.filter(func.lower(Watch.model).like(f"%{model.lower()}%"))
    if condition:
        query = query.filter(func.lower(Watch.condition).like(f"%{condition.lower()}%"))
    if year_min:
        query = query.filter(Watch.year >= year_min)
    if year_max:
        query = query.filter(Watch.year <= year_max)
    if price_min:
        query = query.filter(Watch.current_value_brl >= price_min)
    if price_max:
        query = query.filter(Watch.current_value_brl <= price_max)
    
    return query.all()

@router.get("/my", response_model=List[WatchOut])
def my_watches(
    current_user = Depends(require_role(["user", "store"])),
    db: Session = Depends(get_db)
):
    # List user's or store's watches
    return db.query(Watch).filter(Watch.current_owner_user_id == int(current_user["sub"])).all()

@router.post("/{watch_id}/favorite")
def toggle_favorite(
    watch_id: int,
    current_user = Depends(require_role(["user"])),
    db: Session = Depends(get_db)
):
    """Add or remove watch from favorites"""
    user_id = int(current_user["sub"])
    
    # Check if watch exists
    watch = db.query(Watch).filter(Watch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not found")
    
    # Check if already in favorites
    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.watch_id == watch_id
    ).first()
    
    if existing_favorite:
        # Remove from favorites
        db.delete(existing_favorite)
        db.commit()
        return {"message": "Watch removed from favorites", "is_favorite": False}
    else:
        # Add to favorites
        favorite = Favorite(user_id=user_id, watch_id=watch_id)
        db.add(favorite)
        db.commit()
        return {"message": "Watch added to favorites", "is_favorite": True}

@router.get("/favorites", response_model=List[WatchOut])
def get_favorites(
    current_user = Depends(require_role(["user"])),
    db: Session = Depends(get_db)
):
    """List user's favorite watches"""
    user_id = int(current_user["sub"])
    
    favorites = db.query(Watch).join(Favorite).filter(
        Favorite.user_id == user_id
    ).all()
    
    return favorites

@router.get("/{watch_id}", response_model=WatchOut)
def get_watch(watch_id: int, db: Session = Depends(get_db)):
    watch = db.query(Watch).filter(Watch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not found")
    return watch

@router.get("/{watch_id}/history")
def get_watch_history(
    watch_id: int,
    db: Session = Depends(get_db)
):
    """Detailed history of a watch"""
    watch = db.query(Watch).filter(Watch.id == watch_id).first()
    if not watch:
        raise HTTPException(status_code=404, detail="Watch not found")
    
    # Find transfers
    from app.models import OwnershipTransfer, Evaluation
    transfers = db.query(OwnershipTransfer).filter(
        OwnershipTransfer.watch_id == watch_id
    ).order_by(OwnershipTransfer.created_at.desc()).all()
    
    # Find evaluations
    evaluations = db.query(Evaluation).filter(
        Evaluation.watch_id == watch_id
    ).order_by(Evaluation.created_at.desc()).all()
    
    return {
        "watch": watch,
        "transfers": [{
            "id": t.id,
            "from_user_id": t.from_user_id,
            "to_user_id": t.to_user_id,
            "type": t.type,
            "price_brl": t.price_brl,
            "stellar_tx_hash": t.stellar_tx_hash,
            "created_at": t.created_at
        } for t in transfers],
        "evaluations": [{
            "id": e.id,
            "evaluator_id": e.evaluator_id,
            "condition": e.condition,
            "authenticity": e.authenticity,
            "estimated_value_brl": e.estimated_value_brl,
            "status": e.status,
            "created_at": e.created_at
        } for e in evaluations]
    }

# Add extra endpoints as needed (ex: history, details, etc)
