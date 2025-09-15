from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas import UserCreate, LoginPayload, UserOut, UserProfile
from app.auth import get_password_hash, verify_password, create_access_token, require_role
from app.database import get_db
from app.models import User, Store, OwnershipTransfer, Watch
from stellar_sdk import Keypair

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Verificar se email já existe
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Criar par de chaves Stellar
    stellar_keypair = Keypair.random()
    
    # Criar usuário
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        password_hash=get_password_hash(user.password),
        role=user.role,
        stellar_public_key=stellar_keypair.public_key,
        stellar_secret=stellar_keypair.secret
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Se o usuário é uma loja, criar automaticamente a entrada na tabela Store
    if user.role == "store":
        db_store = Store(
            user_id=db_user.id,
            name=f"Loja {user.full_name}",
            commission_rate=0.05,  # 5% padrão
            credentialed=True  # Para MVP, credenciar automaticamente
        )
        db.add(db_store)
        db.commit()
    
    return db_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscar usuário
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.from_orm(user)
    }

@router.get("/me", response_model=UserOut)
def get_current_user(current_user = Depends(require_role(["admin", "store", "evaluator", "user"])), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

@router.get("/profile")
def get_user_profile(current_user = Depends(require_role(["admin", "store", "evaluator", "user"])), db: Session = Depends(get_db)):
    """Buscar perfil completo do usuário com saldo, loja e estatísticas"""
    user = db.query(User).filter(User.id == int(current_user["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Buscar loja do usuário (se for store)
    my_store = None
    if user.role == "store":
        store = db.query(Store).filter(Store.user_id == user.id).first()
        if store:
            my_store = {
                "id": store.id,
                "name": store.name,
                "credentialed": store.credentialed,
                "commission_rate": store.commission_rate,
                "created_at": store.created_at.isoformat()
            }
    
    # Para admin, contar total de lojas
    total_stores_count = None
    if user.role == "admin":
        total_stores_count = db.query(Store).count()
    
    # Simular saldo (em produção, seria obtido da Stellar)
    if user.balance_brl == 0 and user.role == "store":
        # Simular saldo para lojas
        user.balance_brl = 15000.0  # R$ 15.000 simulado
        user.balance_xlm = 2.5  # 2.5 XLM simulado
    elif user.balance_brl == 0 and user.role == "evaluator":
        # Simular saldo para avaliadores
        user.balance_brl = 8500.0  # R$ 8.500 simulado
        user.balance_xlm = 1.2  # 1.2 XLM simulado
    elif user.balance_brl == 0 and user.role == "user":
        # Simular saldo para usuários
        user.balance_brl = 25000.0  # R$ 25.000 simulado
        user.balance_xlm = 3.8  # 3.8 XLM simulado
    elif user.balance_brl == 0 and user.role == "admin":
        # Simular saldo para admin
        user.balance_brl = 50000.0  # R$ 50.000 simulado
        user.balance_xlm = 7.5  # 7.5 XLM simulado
    
    # Atualizar no banco
    db.commit()
    
    # Preparar dados da loja se existir
    store_data = None
    if my_store:
        store_data = my_store  # my_store já é um dicionário pronto
    
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "stellar_public_key": user.stellar_public_key,
        "balance_brl": user.balance_brl,
        "balance_xlm": user.balance_xlm,
        "created_at": user.created_at,
        "my_store": store_data,
        "total_stores_count": total_stores_count
    }

@router.get("/transaction-history")
def get_user_transaction_history(
    current_user = Depends(require_role(["user", "store"])),
    db: Session = Depends(get_db)
):
    """Histórico de transações do usuário"""
    user_id = int(current_user["sub"])
    
    # Buscar transferências como comprador e vendedor
    transfers_as_buyer = db.query(OwnershipTransfer).filter(
        OwnershipTransfer.to_user_id == user_id
    ).order_by(OwnershipTransfer.created_at.desc()).all()
    
    transfers_as_seller = db.query(OwnershipTransfer).filter(
        OwnershipTransfer.from_user_id == user_id
    ).order_by(OwnershipTransfer.created_at.desc()).all()
    
    # Buscar relógios comprados
    owned_watches = db.query(Watch).filter(
        Watch.current_owner_user_id == user_id
    ).all()
    
    return {
        "purchases": [{
            "id": t.id,
            "watch_id": t.watch_id,
            "watch": {
                "brand": t.watch.brand,
                "model": t.watch.model,
                "serial_number": t.watch.serial_number
            } if t.watch else None,
            "from_user_id": t.from_user_id,
            "price_brl": t.price_brl,
            "type": t.type,
            "stellar_tx_hash": t.stellar_tx_hash,
            "created_at": t.created_at
        } for t in transfers_as_buyer],
        "sales": [{
            "id": t.id,
            "watch_id": t.watch_id,
            "watch": {
                "brand": t.watch.brand,
                "model": t.watch.model,
                "serial_number": t.watch.serial_number
            } if t.watch else None,
            "to_user_id": t.to_user_id,
            "price_brl": t.price_brl,
            "type": t.type,
            "stellar_tx_hash": t.stellar_tx_hash,
            "created_at": t.created_at
        } for t in transfers_as_seller],
        "owned_watches": [{
            "id": w.id,
            "brand": w.brand,
            "model": w.model,
            "serial_number": w.serial_number,
            "current_value_brl": w.current_value_brl,
            "status": w.status,
            "nft_code": w.nft_code
        } for w in owned_watches]
    }
