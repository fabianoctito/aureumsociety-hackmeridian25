"""
Stellar Contracts Router - Versão Simplificada para Testes
Simula contratos inteligentes na Stellar para NFTs e Escrow
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

from ..database import get_db
from ..routers.auth import get_current_user
from ..models import User, Watch, ResellOffer
from ..stellar import create_nft_asset, transfer_nft, simulate_payment_conversion

router = APIRouter(prefix="/stellar", tags=["Contratos Stellar"])

# Schemas simplificados
class WatchRegistrationRequest(BaseModel):
    watch_id: int
    serial_number: str
    brand: str
    model: str

class WatchRegistrationResponse(BaseModel):
    success: bool
    nft_token: str
    blockchain_hash: str
    watch_id: int

class NFTTransferRequest(BaseModel):
    from_watch_id: int
    to_address: str
    
class NFTTransferResponse(BaseModel):
    success: bool
    transaction_hash: str
    new_owner: str

class EscrowRequest(BaseModel):
    offer_id: int
    amount_brl: float

class EscrowResponse(BaseModel):
    success: bool
    escrow_id: str
    amount_locked: float

# Endpoints simplificados para teste

@router.post("/watches/register", response_model=WatchRegistrationResponse)
def register_watch(
    request: WatchRegistrationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registrar relógio na blockchain como NFT"""
    try:
        # Verificar se o relógio existe
        watch = db.query(Watch).filter(Watch.id == request.watch_id).first()
        if not watch:
            raise HTTPException(status_code=404, detail="Relógio não encontrado")
        
        # Simular criação do NFT
        nft_data = create_nft_asset(
            watch_id=request.watch_id,
            brand=request.brand,
            model=request.model,
            serial_number=request.serial_number,
            receiver_public="SIMULATED_ADDRESS"
        )
        
        return WatchRegistrationResponse(
            success=True,
            nft_token=nft_data["asset_code"],
            blockchain_hash=nft_data["tx_hash"],
            watch_id=request.watch_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao registrar NFT: {str(e)}")

@router.get("/watches/{watch_id}/nft-status")
def get_nft_status(
    watch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verificar status do NFT do relógio"""
    try:
        watch = db.query(Watch).filter(Watch.id == watch_id).first()
        if not watch:
            raise HTTPException(status_code=404, detail="Relógio não encontrado")
            
        return {
            "watch_id": watch_id,
            "has_nft": True,  # Simular que sempre tem NFT
            "nft_token": f"W{watch_id:06d}",
            "blockchain_verified": True,
            "current_owner": current_user.name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar NFT: {str(e)}")

@router.post("/escrow/create", response_model=EscrowResponse) 
def create_escrow(
    request: EscrowRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Criar escrow para transação"""
    try:
        # Verificar se a oferta existe
        offer = db.query(ResellOffer).filter(ResellOffer.id == request.offer_id).first()
        if not offer:
            raise HTTPException(status_code=404, detail="Oferta não encontrada")
            
        # Simular criação do escrow
        escrow_id = f"ESCROW_{request.offer_id}_{datetime.now().timestamp()}"
        
        return EscrowResponse(
            success=True,
            escrow_id=escrow_id,
            amount_locked=request.amount_brl
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar escrow: {str(e)}")

@router.post("/escrow/{escrow_id}/confirm-delivery")
def confirm_delivery(
    escrow_id: str,
    current_user: User = Depends(get_current_user)
):
    """Confirmar entrega e liberar escrow"""
    try:
        return {
            "success": True,
            "escrow_id": escrow_id,
            "status": "completed",
            "released_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao confirmar entrega: {str(e)}")

@router.get("/escrow/{escrow_id}/status")
def get_escrow_status(
    escrow_id: str,
    current_user: User = Depends(get_current_user)
):
    """Verificar status do escrow"""
    return {
        "escrow_id": escrow_id,
        "status": "active",
        "amount_locked": 50000.0,
        "created_at": datetime.now().isoformat()
    }

@router.post("/nft/transfer", response_model=NFTTransferResponse)
def transfer_nft_endpoint(
    request: NFTTransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Transferir NFT do relógio"""
    try:
        # Simular transferência
        tx_hash = f"TX_TRANSFER_{request.from_watch_id}_{datetime.now().timestamp()}"
        
        return NFTTransferResponse(
            success=True,
            transaction_hash=tx_hash,
            new_owner=request.to_address
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao transferir NFT: {str(e)}")

@router.get("/nft/{watch_id}/history")
def get_nft_history(
    watch_id: int,
    current_user: User = Depends(get_current_user)
):
    """Histórico de transferências do NFT"""
    return {
        "watch_id": watch_id,
        "nft_token": f"W{watch_id:06d}",
        "transactions": [
            {
                "type": "mint",
                "hash": f"TX_MINT_{watch_id}",
                "timestamp": "2025-08-01T10:00:00Z",
                "owner": "Original Owner"
            },
            {
                "type": "transfer", 
                "hash": f"TX_TRANSFER_{watch_id}",
                "timestamp": "2025-08-13T15:30:00Z",
                "owner": current_user.name
            }
        ]
    }

@router.get("/nft/{watch_id}/verify")
def verify_nft(
    watch_id: int,
    current_user: User = Depends(get_current_user)
):
    """Verificar autenticidade do NFT"""
    return {
        "watch_id": watch_id,
        "nft_valid": True,
        "blockchain_verified": True,
        "certificate_hash": f"CERT_{watch_id}_VERIFIED",
        "verified_at": datetime.now().isoformat()
    }

# Endpoints administrativos

@router.get("/admin/stellar-transactions")
def list_stellar_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Listar transações Stellar para admin"""
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    return {
        "total_transactions": 42,
        "nft_registrations": 15,
        "transfers": 20,
        "escrows_created": 7,
        "last_updated": datetime.now().isoformat()
    }

@router.get("/admin/escrows")
def list_escrows(
    current_user: User = Depends(get_current_user)
):
    """Listar escrows para admin"""
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
        
    return {
        "active_escrows": 5,
        "completed_escrows": 12,
        "total_locked": 250000.0,
        "escrows": [
            {
                "id": "ESCROW_001",
                "amount": 50000.0,
                "status": "active",
                "created_at": "2025-08-13T10:00:00Z"
            }
        ]
    }
