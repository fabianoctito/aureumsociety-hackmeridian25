from fastapi import APIRouter, Depends
from app.auth import require_role
import time
from datetime import datetime

router = APIRouter(prefix="/stellar", tags=["stellar-mvp"], include_in_schema=True)

@router.post("/watches/register")
async def register_watch_nft_mvp(current_user = Depends(require_role(["admin"]))):
    """Registra um relógio como NFT - MVP SIMULADO"""
    nft_code = f"W{int(time.time()) % 1000000:06d}"
    return {
        "status": "success",
        "nft_code": nft_code,
        "nft_issuer": "GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
        "laudo_hash": f"sha256_mvp_laudo_{nft_code}",
        "transaction_hash": f"mvp_tx_{int(time.time())}_{nft_code}",
        "blockchain_address": "stellar:mvp_simulation",
        "simulation": True,
        "mvp_mode": True,
        "message": "NFT registrado com sucesso na simulação MVP"
    }

@router.get("/watches/{watch_id}/nft-status")
def get_nft_status_mvp(watch_id: int, current_user = Depends(require_role(["admin", "user"]))):
    """Verifica status do NFT - MVP SIMULADO"""
    return {
        "status": "tokenized",
        "token_id": f"W{watch_id:06d}",
        "current_owner": 1,
        "issuer": "GAYJA3XAVTTHEF5QLZRMQ374P4MSXJSRJMGBVSDECLHGANUOXBBAZU5C",
        "blockchain_address": "stellar:mvp_simulation",
        "simulation": True,
        "mvp_mode": True,
        "message": "NFT ativo e verificado na simulação MVP"
    }

@router.post("/nft/transfer")
def transfer_nft_mvp(current_user = Depends(require_role(["admin"]))):
    """Transfere NFT - MVP SIMULADO"""
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
def verify_nft_mvp(watch_id: int, current_user = Depends(require_role(["admin", "user"]))):
    """Verifica autenticidade do NFT - MVP SIMULADO"""
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
def get_nft_history_mvp(watch_id: int, current_user = Depends(require_role(["admin", "user"]))):
    """Obtém histórico do NFT - MVP SIMULADO"""
    return [
        {
            "transfer_id": f"mvp_{watch_id}_1",
            "transfer_type": "mint",
            "from_user_id": 0,
            "to_user_id": 1,
            "timestamp": datetime.utcnow().isoformat(),
            "stellar_tx_hash": f"mvp_mint_tx_{watch_id}_{int(time.time())}",
            "price_brl": 0,
            "simulation": True,
            "mvp_mode": True
        },
        {
            "transfer_id": f"mvp_{watch_id}_2",
            "transfer_type": "sale",
            "from_user_id": 1,
            "to_user_id": 2,
            "timestamp": datetime.utcnow().isoformat(),
            "stellar_tx_hash": f"mvp_sale_tx_{watch_id}_{int(time.time())}",
            "price_brl": 95000.0,
            "simulation": True,
            "mvp_mode": True
        }
    ]

@router.get("/admin/stellar-transactions")
def get_stellar_transactions_mvp(current_user = Depends(require_role(["admin"]))):
    """Lista transações Stellar - MVP SIMULADO"""
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
