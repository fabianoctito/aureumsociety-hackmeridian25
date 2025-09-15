from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.auth import require_role
from app.database import get_db
from app.models import Watch, User, NFTToken
from app.stellar import create_nft_asset, transfer_nft, get_nft_history
from typing import Optional, List, Any
import time
from datetime import datetime

router = APIRouter(prefix="/stellar", tags=["stellar"])

# Schemas simplificados
class StellarWatchRegister(BaseModel):
    serial: str
    brand: str
    model: str
    condition: str
    evaluator_id: int
    timestamp: str
    photos_hashes: List[str]
    pdf_hash: str
    estimated_value_brl: float

class NFTTransferRequest(BaseModel):
    watch_id: int
    from_user_id: int
    to_user_id: int

@router.post("/watches/register")
async def register_watch_nft(
    watch_data: Optional[dict] = None,
    current_user = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Registra um relógio na blockchain Stellar como NFT (SIMULADO MVP)
    """
    # SEMPRE RETORNAR SUCESSO SIMULADO PARA MVP
    nft_code = f"W{int(time.time()) % 1000000:06d}"
    
    return {
        "status": "success",
        "nft_code": nft_code,
        "nft_issuer": "GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
        "laudo_hash": f"sha256_laudo_{nft_code}",
        "transaction_hash": f"mvp_tx_{int(time.time())}_{nft_code}",
        "blockchain_address": "stellar:GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
        "simulation": True,
        "mvp_mode": True,
        "message": "NFT registrado com sucesso na simulação MVP"
    }

@router.get("/watches/{watch_id}/nft-status")
def get_nft_status(
    watch_id: int,
    current_user = Depends(require_role(["admin", "user"])),
    db: Session = Depends(get_db)
):
    """
    Verifica o status do NFT de um relógio (SIMULADO MVP)
    """
    # SEMPRE RETORNAR STATUS POSITIVO PARA MVP
    return {
        "status": "tokenized",
        "token_id": f"W{watch_id:06d}",
        "current_owner": 1,  # Admin
        "issuer": "GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
        "blockchain_address": "stellar:simulation_mvp",
        "simulation": True,
        "mvp_mode": True,
        "message": "NFT ativo e verificado na simulação MVP"
    }

@router.post("/nft/transfer")
def transfer_nft_ownership(
    transfer_data: Optional[dict] = None,
    current_user = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Transfere a propriedade de um NFT entre usuários (SIMULADO MVP)
    """
    # SEMPRE RETORNAR SUCESSO PARA MVP
    return {
        "status": "success",
        "from_user": "Usuario Vendedor",
        "to_user": "Usuario Comprador",
        "transaction_hash": f"mvp_transfer_tx_{int(time.time())}",
        "asset_code": f"W{int(time.time()) % 1000000:06d}",
        "simulation": True,
        "mvp_mode": True,
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Transferência NFT realizada com sucesso na simulação MVP"
    }

@router.get("/nft/{watch_id}/verify")
def verify_nft_authenticity(
    watch_id: int,
    current_user = Depends(require_role(["admin", "user"])),
    db: Session = Depends(get_db)
):
    """
    Verifica a autenticidade de um NFT na blockchain (SIMULADO MVP)
    """
    # SEMPRE RETORNAR VERIFICAÇÃO POSITIVA PARA MVP
    return {
        "authenticity_status": "authentic",
        "serial": f"ROL{watch_id}558",
        "brand": "Rolex",
        "model": "Submariner",
        "laudo_hash": f"sha256_mvp_laudo_{watch_id}",
        "nft_code": f"W{watch_id:06d}",
        "issuer": "GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
        "blockchain_verified": True,
        "simulation": True,
        "mvp_mode": True,
        "verified_at": datetime.utcnow().isoformat(),
        "message": "NFT autenticado com sucesso na simulação MVP"
    }

@router.get("/nft/{watch_id}/history")
def get_nft_ownership_history(
    watch_id: int,
    current_user = Depends(require_role(["admin", "user"])),
    db: Session = Depends(get_db)
):
    """
    Obtém o histórico de propriedade de um NFT (SIMULADO MVP)
    """
    # SEMPRE RETORNAR HISTÓRICO SIMULADO PARA MVP
    return [
        {
            "transfer_id": f"mvp_{watch_id}_1",
            "transfer_type": "mint",
            "from_user_id": 0,  # Sistema
            "to_user_id": 1,    # Admin
            "timestamp": datetime.utcnow().isoformat(),
            "stellar_tx_hash": f"mvp_mint_tx_{watch_id}_{int(time.time())}",
            "price_brl": 0,
            "simulation": True,
            "mvp_mode": True
        },
        {
            "transfer_id": f"mvp_{watch_id}_2",
            "transfer_type": "sale",
            "from_user_id": 1,  # Admin
            "to_user_id": 2,    # Usuario
            "timestamp": datetime.utcnow().isoformat(),
            "stellar_tx_hash": f"mvp_sale_tx_{watch_id}_{int(time.time())}",
            "price_brl": 95000.0,
            "simulation": True,
            "mvp_mode": True
        }
    ]

@router.get("/admin/stellar-transactions")
def get_stellar_transactions(
    current_user = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """
    Lista todas as transações Stellar do marketplace (SIMULADO MVP)
    """
    # SEMPRE RETORNAR TRANSAÇÕES SIMULADAS PARA MVP
    return [
        {
            "id": "mvp_1",
            "transaction_hash": f"mvp_tx_{int(time.time())}_1",
            "transaction_type": "nft_mint",
            "from_account": "SYSTEM",
            "to_account": "GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
            "asset_code": "W000001",
            "amount": "1",
            "watch_id": 1,
            "user_id": 1,
            "status": "confirmed",
            "created_at": datetime.utcnow().isoformat(),
            "simulation": True,
            "mvp_mode": True
        },
        {
            "id": "mvp_2",
            "transaction_hash": f"mvp_tx_{int(time.time())}_2",
            "transaction_type": "nft_transfer",
            "from_account": "GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
            "to_account": "GBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "asset_code": "W000001",
            "amount": "1",
            "watch_id": 1,
            "user_id": 2,
            "status": "confirmed",
            "created_at": datetime.utcnow().isoformat(),
            "simulation": True,
            "mvp_mode": True
        }
    ]
