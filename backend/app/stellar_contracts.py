# CONTRATOS STELLAR - MARKETPLACE DE RELÓGIOS NFT
# Implementação dos contratos de Registro, Escrow e NFT

import json
import hashlib
import uuid
import os
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, Optional, List, Tuple
from stellar_sdk import (
    Server, Keypair, Account, TransactionBuilder, Asset, 
    Payment, ChangeTrust, ManageData, TextMemo
)
from stellar_sdk.exceptions import BadRequestError
import boto3
from botocore.exceptions import ClientError

from .models import Watch, OwnershipTransfer, Escrow, NFTToken
from .database import get_db

class StellarContracts:
    """
    Gerenciador dos contratos Stellar para o marketplace
    """
    
    def __init__(self):
        self.server = Server("https://horizon-testnet.stellar.org")
        self.network_passphrase = "Test SDF Network ; September 2015"
        
        # Conta master da plataforma (gerar dinamicamente ou usar variável ambiente)
        master_secret = os.getenv("STELLAR_MASTER_SECRET")
        if not master_secret:
            # Gerar nova chave para desenvolvimento
            temp_keypair = Keypair.random()
            master_secret = temp_keypair.secret
            print(f"🔑 Nova chave Stellar gerada: {master_secret}")
            print(f"🔑 Chave pública: {temp_keypair.public_key}")
        
        self.master_keypair = Keypair.from_secret(master_secret)
        self.master_account = self.master_keypair.public_key
        
        # Taxa de rede Stellar
        self.base_fee = 100
        
        # S3 para armazenar laudos
        self.s3_client = boto3.client('s3')
        self.bucket_name = "marketplace-relogios-laudos"

# ========================= 1. CONTRATO DE REGISTRO DE RELÓGIOS =========================

class WatchRegistrationContract:
    """
    Contrato para padronizar e imutabilizar o cadastro de relógios
    """
    
    def __init__(self, stellar_contracts: StellarContracts):
        self.stellar = stellar_contracts
        
    def validate_evaluation_report(self, report_data: Dict) -> bool:
        """
        Valida o laudo de avaliação
        """
        required_fields = [
            'serial', 'brand', 'model', 'condition', 
            'evaluator_id', 'timestamp', 'photos_hashes', 'pdf_hash'
        ]
        
        for field in required_fields:
            if field not in report_data:
                raise ValueError(f"Campo obrigatório ausente: {field}")
                
        # Validar condição
        valid_conditions = ['excellent', 'good', 'fair', 'poor']
        if report_data['condition'] not in valid_conditions:
            raise ValueError(f"Condição inválida: {report_data['condition']}")
            
        return True
    
    def upload_report_to_s3(self, report_data: Dict, watch_serial: str) -> str:
        """
        Upload do laudo para S3 e retorna hash SHA256
        """
        try:
            # Serializar JSON de forma determinística
            report_json = json.dumps(report_data, sort_keys=True, separators=(',', ':'))
            
            # Calcular hash SHA256
            report_hash = hashlib.sha256(report_json.encode()).hexdigest()
            
            # Nome do arquivo
            file_key = f"laudos/{watch_serial}/{report_hash}.json"
            
            # Upload para S3
            self.stellar.s3_client.put_object(
                Bucket=self.stellar.bucket_name,
                Key=file_key,
                Body=report_json,
                ContentType='application/json',
                Metadata={
                    'watch_serial': watch_serial,
                    'evaluator_id': str(report_data['evaluator_id']),
                    'timestamp': report_data['timestamp']
                }
            )
            
            return report_hash
            
        except ClientError as e:
            raise Exception(f"Erro ao fazer upload do laudo: {e}")
    
    def mint_watch_nft(self, watch_serial: str, owner_public_key: str, report_hash: str) -> Tuple[str, str]:
        """
        Cria NFT único para o relógio na Stellar
        """
        try:
            # Código do asset único
            asset_code = f"NRF-{watch_serial[:6]}"  # Limitado a 12 chars
            
            # Criar conta emissora (ou usar existente)
            issuer_keypair = Keypair.random()
            issuer_account = issuer_keypair.public_key
            
            # Criar conta emissora na rede
            self._create_stellar_account(issuer_account)
            
            # Asset NFT
            nft_asset = Asset(asset_code, issuer_account)
            
            # Criar trustline do dono para o asset
            self._create_trustline(owner_public_key, nft_asset)
            
            # Emitir 1 unidade do NFT
            source_account = self.stellar.server.load_account(issuer_account)
            
            transaction = (
                TransactionBuilder(
                    source_account=source_account,
                    network_passphrase=self.stellar.network_passphrase,
                    base_fee=self.stellar.base_fee
                )
                .append_payment_op(
                    destination=owner_public_key,
                    asset=nft_asset,
                    amount="1"
                )
                .add_text_memo(f"NFT-MINT:{watch_serial}:{report_hash}")
                .set_timeout(30)
                .build()
            )
            
            transaction.sign(issuer_keypair)
            response = self.stellar.server.submit_transaction(transaction)
            
            return asset_code, issuer_account
            
        except Exception as e:
            raise Exception(f"Erro ao criar NFT: {e}")
    
    def register_watch(self, evaluation_data: Dict, owner_user_id: int) -> Dict:
        """
        Processo completo de registro de relógio
        """
        db = next(get_db())
        
        try:
            # 1. Validar laudo
            self.validate_evaluation_report(evaluation_data)
            
            # 2. Verificar se serial é único
            existing_watch = db.query(Watch).filter(Watch.serial == evaluation_data['serial']).first()
            if existing_watch:
                raise ValueError(f"Relógio com serial {evaluation_data['serial']} já existe")
            
            # 3. Upload do laudo para S3 e hash
            report_hash = self.upload_report_to_s3(evaluation_data, evaluation_data['serial'])
            
            # 4. Obter chave pública do dono (da tabela User)
            from .models import User
            owner = db.query(User).filter(User.id == owner_user_id).first()
            if not owner or not owner.stellar_public_key:
                raise ValueError("Usuário deve ter chave Stellar configurada")
            
            # 5. Mint NFT
            asset_code, issuer_account = self.mint_watch_nft(
                evaluation_data['serial'], 
                owner.stellar_public_key, 
                report_hash
            )
            
            # 6. Criar registro no banco
            watch = Watch(
                serial=evaluation_data['serial'],
                brand=evaluation_data['brand'],
                model=evaluation_data['model'],
                condition=evaluation_data['condition'],
                laudo_hash=report_hash,
                nft_code=asset_code,
                nft_issuer=issuer_account,
                current_owner_user_id=owner_user_id,
                price_brl=evaluation_data.get('estimated_value_brl', 0),
                status="tokenized",
                created_at=datetime.now(timezone.utc)
            )
            
            db.add(watch)
            db.commit()
            db.refresh(watch)
            
            # 7. Registrar NFT Token
            nft_token = NFTToken(
                watch_id=watch.id,
                token_id=f"{asset_code}:{issuer_account}",
                asset_code=asset_code,
                issuer_account=issuer_account,
                current_owner_stellar_key=owner.stellar_public_key,
                metadata_hash=report_hash,
                mint_transaction_hash=response['hash'],
                created_at=datetime.now(timezone.utc)
            )
            
            db.add(nft_token)
            db.commit()
            
            return {
                "watch_id": watch.id,
                "serial": watch.serial,
                "nft_code": asset_code,
                "nft_issuer": issuer_account,
                "laudo_hash": report_hash,
                "status": "tokenized",
                "message": f"Relógio {watch.serial} tokenizado com sucesso!"
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro no registro: {e}")
        finally:
            db.close()
    
    def _create_stellar_account(self, public_key: str):
        """
        Cria conta na Stellar Testnet usando Friendbot
        """
        import requests
        
        try:
            response = requests.get(f"https://friendbot.stellar.org?addr={public_key}")
            if response.status_code != 200:
                raise Exception("Erro ao criar conta Stellar")
        except Exception as e:
            raise Exception(f"Erro ao criar conta: {e}")
    
    def _create_trustline(self, account_key: str, asset: Asset):
        """
        Cria trustline para asset NFT
        """
        # Esta função assumiria que a chave privada está disponível
        # Em produção, seria necessário um mecanismo de assinatura seguro
        pass

# ========================= 2. CONTRATO DE PAGAMENTOS / ESCROW =========================

class EscrowContract:
    """
    Contrato para garantir pagamentos seguros via escrow
    """
    
    def __init__(self, stellar_contracts: StellarContracts):
        self.stellar = stellar_contracts
        self.usdc_asset = Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5")  # Testnet USDC
        
    def create_escrow_account(self) -> Tuple[str, str]:
        """
        Cria conta de escrow única para transação
        """
        escrow_keypair = Keypair.random()
        escrow_public = escrow_keypair.public_key
        escrow_secret = escrow_keypair.secret
        
        # Criar conta na rede
        self._create_stellar_account(escrow_public)
        
        # Criar trustline para USDC
        self._create_usdc_trustline(escrow_public, escrow_secret)
        
        return escrow_public, escrow_secret
    
    def deposit_to_escrow(self, offer_id: int, amount_usdc: Decimal, depositor_key: str) -> Dict:
        """
        Depósito em escrow para uma oferta de revenda
        """
        db = next(get_db())
        
        try:
            # Criar conta de escrow
            escrow_public, escrow_secret = self.create_escrow_account()
            
            # Registrar escrow no banco
            escrow = Escrow(
                offer_id=offer_id,
                escrow_stellar_account=escrow_public,
                escrow_secret_key=escrow_secret,  # Em produção: criptografar
                amount_usdc=amount_usdc,
                depositor_stellar_key=depositor_key,
                status="holding",
                created_at=datetime.now(timezone.utc)
            )
            
            db.add(escrow)
            db.commit()
            db.refresh(escrow)
            
            return {
                "escrow_id": escrow.id,
                "escrow_account": escrow_public,
                "amount_usdc": str(amount_usdc),
                "status": "holding",
                "message": f"Escrow criado. Deposite {amount_usdc} USDC em {escrow_public}"
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro ao criar escrow: {e}")
        finally:
            db.close()
    
    def confirm_delivery(self, escrow_id: int, confirmer_type: str) -> Dict:
        """
        Confirma entrega/recebimento (seller ou evaluator)
        """
        db = next(get_db())
        
        try:
            escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()
            if not escrow:
                raise ValueError("Escrow não encontrado")
            
            if escrow.status != "holding":
                raise ValueError("Escrow não está em estado holding")
            
            # Atualizar confirmação
            if confirmer_type == "seller":
                escrow.seller_confirmed = True
                escrow.seller_confirmed_at = datetime.now(timezone.utc)
            elif confirmer_type == "evaluator":
                escrow.evaluator_confirmed = True
                escrow.evaluator_confirmed_at = datetime.now(timezone.utc)
            else:
                raise ValueError("Tipo de confirmador inválido")
            
            db.commit()
            
            # Se ambos confirmaram, liberar fundos
            if escrow.seller_confirmed and escrow.evaluator_confirmed:
                return self._release_escrow_funds(escrow_id)
            
            return {
                "escrow_id": escrow_id,
                "status": "partially_confirmed",
                "seller_confirmed": escrow.seller_confirmed,
                "evaluator_confirmed": escrow.evaluator_confirmed,
                "message": f"Confirmação de {confirmer_type} registrada"
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro na confirmação: {e}")
        finally:
            db.close()
    
    def _release_escrow_funds(self, escrow_id: int) -> Dict:
        """
        Libera fundos do escrow com splits automáticos
        """
        db = next(get_db())
        
        try:
            escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()
            if not escrow:
                raise ValueError("Escrow não encontrado")
            
            # Obter dados da oferta
            from .models import ResellOffer
            offer = db.query(ResellOffer).filter(ResellOffer.id == escrow.offer_id).first()
            if not offer:
                raise ValueError("Oferta não encontrada")
            
            # Calcular splits
            total_amount = escrow.amount_usdc
            admin_commission = total_amount * Decimal('0.08')  # 8%
            seller_amount = total_amount - admin_commission
            
            # Executar transferências Stellar
            tx_admin = self._transfer_usdc(
                escrow.escrow_stellar_account,
                escrow.escrow_secret_key,
                self.stellar.master_account,
                admin_commission,
                f"ADMIN-COMMISSION:{escrow_id}"
            )
            
            tx_seller = self._transfer_usdc(
                escrow.escrow_stellar_account,
                escrow.escrow_secret_key,
                offer.seller_stellar_key,
                seller_amount,
                f"SELLER-PAYMENT:{escrow_id}"
            )
            
            # Atualizar escrow
            escrow.status = "released"
            escrow.released_at = datetime.now(timezone.utc)
            escrow.admin_tx_hash = tx_admin
            escrow.seller_tx_hash = tx_seller
            escrow.admin_amount_usdc = admin_commission
            escrow.seller_amount_usdc = seller_amount
            
            db.commit()
            
            return {
                "escrow_id": escrow_id,
                "status": "released",
                "total_amount": str(total_amount),
                "admin_commission": str(admin_commission),
                "seller_amount": str(seller_amount),
                "admin_tx": tx_admin,
                "seller_tx": tx_seller,
                "message": "Fundos liberados com sucesso!"
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro na liberação: {e}")
        finally:
            db.close()
    
    def _transfer_usdc(self, from_account: str, from_secret: str, to_account: str, 
                      amount: Decimal, memo: str) -> str:
        """
        Executa transferência USDC na Stellar
        """
        try:
            from_keypair = Keypair.from_secret(from_secret)
            source_account = self.stellar.server.load_account(from_account)
            
            transaction = (
                TransactionBuilder(
                    source_account=source_account,
                    network_passphrase=self.stellar.network_passphrase,
                    base_fee=self.stellar.base_fee
                )
                .append_payment_op(
                    destination=to_account,
                    asset=self.usdc_asset,
                    amount=str(amount)
                )
                .add_text_memo(memo)
                .set_timeout(30)
                .build()
            )
            
            transaction.sign(from_keypair)
            response = self.stellar.server.submit_transaction(transaction)
            
            return response['hash']
            
        except Exception as e:
            raise Exception(f"Erro na transferência USDC: {e}")
    
    def _create_stellar_account(self, public_key: str):
        """Cria conta Stellar via Friendbot"""
        import requests
        response = requests.get(f"https://friendbot.stellar.org?addr={public_key}")
        if response.status_code != 200:
            raise Exception("Erro ao criar conta Stellar")
    
    def _create_usdc_trustline(self, account_key: str, account_secret: str):
        """Cria trustline para USDC"""
        try:
            keypair = Keypair.from_secret(account_secret)
            source_account = self.stellar.server.load_account(account_key)
            
            transaction = (
                TransactionBuilder(
                    source_account=source_account,
                    network_passphrase=self.stellar.network_passphrase,
                    base_fee=self.stellar.base_fee
                )
                .append_change_trust_op(asset=self.usdc_asset)
                .set_timeout(30)
                .build()
            )
            
            transaction.sign(keypair)
            self.stellar.server.submit_transaction(transaction)
            
        except Exception as e:
            raise Exception(f"Erro ao criar trustline USDC: {e}")

# ========================= 3. CONTRATO DE NFT (TOKENIZAÇÃO E TRANSFERÊNCIA) =========================

class NFTContract:
    """
    Contrato para gerenciar NFTs de relógios na Stellar
    """
    
    def __init__(self, stellar_contracts: StellarContracts):
        self.stellar = stellar_contracts
        
    def transfer_nft(self, watch_id: int, from_user_id: int, to_user_id: int) -> Dict:
        """
        Transfere NFT de relógio entre usuários
        """
        db = next(get_db())
        
        try:
            # Obter dados do relógio e NFT
            watch = db.query(Watch).filter(Watch.id == watch_id).first()
            if not watch:
                raise ValueError("Relógio não encontrado")
            
            nft_token = db.query(NFTToken).filter(NFTToken.watch_id == watch_id).first()
            if not nft_token:
                raise ValueError("NFT não encontrado")
            
            # Obter usuários
            from .models import User
            from_user = db.query(User).filter(User.id == from_user_id).first()
            to_user = db.query(User).filter(User.id == to_user_id).first()
            
            if not from_user or not to_user:
                raise ValueError("Usuário não encontrado")
            
            if not from_user.stellar_public_key or not to_user.stellar_public_key:
                raise ValueError("Usuários devem ter chaves Stellar configuradas")
            
            # Criar asset NFT
            nft_asset = Asset(nft_token.asset_code, nft_token.issuer_account)
            
            # Criar trustline para o destinatário (se necessário)
            self._ensure_trustline(to_user.stellar_public_key, nft_asset)
            
            # Executar transferência
            tx_hash = self._execute_nft_transfer(
                from_user.stellar_public_key,
                from_user.stellar_secret_key,  # Em produção: usar assinatura segura
                to_user.stellar_public_key,
                nft_asset,
                watch.serial
            )
            
            # Atualizar registros
            watch.current_owner_user_id = to_user_id
            nft_token.current_owner_stellar_key = to_user.stellar_public_key
            nft_token.last_transfer_hash = tx_hash
            nft_token.updated_at = datetime.now(timezone.utc)
            
            # Registrar transferência
            transfer = OwnershipTransfer(
                watch_id=watch_id,
                from_user_id=from_user_id,
                to_user_id=to_user_id,
                type="sale",
                price_brl=watch.price_brl,
                stellar_tx_hash=tx_hash,
                created_at=datetime.now(timezone.utc)
            )
            
            db.add(transfer)
            db.commit()
            
            return {
                "watch_id": watch_id,
                "nft_token_id": nft_token.token_id,
                "from_user": from_user.email,
                "to_user": to_user.email,
                "transaction_hash": tx_hash,
                "message": f"NFT do relógio {watch.serial} transferido com sucesso!"
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Erro na transferência NFT: {e}")
        finally:
            db.close()
    
    def get_nft_ownership_history(self, watch_id: int) -> List[Dict]:
        """
        Retorna histórico de propriedade do NFT
        """
        db = next(get_db())
        
        try:
            transfers = db.query(OwnershipTransfer).filter(OwnershipTransfer.watch_id == watch_id).order_by(OwnershipTransfer.created_at).all()
            
            history = []
            for transfer in transfers:
                history.append({
                    "transfer_id": transfer.id,
                    "from_user_id": transfer.from_user_id,
                    "to_user_id": transfer.to_user_id,
                    "transfer_type": transfer.type,
                    "price_brl": float(transfer.price_brl),
                    "stellar_tx_hash": transfer.stellar_tx_hash,
                    "timestamp": transfer.created_at.isoformat()
                })
            
            return history
            
        except Exception as e:
            raise Exception(f"Erro ao obter histórico: {e}")
        finally:
            db.close()
    
    def verify_nft_authenticity(self, watch_id: int) -> Dict:
        """
        Verifica autenticidade do NFT na blockchain
        """
        db = next(get_db())
        
        try:
            watch = db.query(Watch).filter(Watch.id == watch_id).first()
            nft_token = db.query(NFTToken).filter(NFTToken.watch_id == watch_id).first()
            
            if not watch or not nft_token:
                raise ValueError("Relógio ou NFT não encontrado")
            
            # Verificar na Stellar
            try:
                account = self.stellar.server.accounts().account_id(nft_token.current_owner_stellar_key).call()
                
                # Verificar se possui o asset
                nft_asset_line = None
                for balance in account['balances']:
                    if (balance['asset_type'] != 'native' and 
                        balance['asset_code'] == nft_token.asset_code and
                        balance['asset_issuer'] == nft_token.issuer_account):
                        nft_asset_line = balance
                        break
                
                if nft_asset_line and float(nft_asset_line['balance']) == 1.0:
                    authenticity_status = "verified"
                    message = "NFT autêntico e verificado na blockchain"
                else:
                    authenticity_status = "invalid"
                    message = "NFT não encontrado na conta atual"
                
            except Exception as e:
                authenticity_status = "error"
                message = f"Erro na verificação: {e}"
            
            return {
                "watch_id": watch_id,
                "serial": watch.serial,
                "nft_token_id": nft_token.token_id,
                "current_owner": nft_token.current_owner_stellar_key,
                "laudo_hash": watch.laudo_hash,
                "mint_tx": nft_token.mint_transaction_hash,
                "authenticity_status": authenticity_status,
                "message": message
            }
            
        except Exception as e:
            raise Exception(f"Erro na verificação: {e}")
        finally:
            db.close()
    
    def _execute_nft_transfer(self, from_account: str, from_secret: str, to_account: str, 
                             nft_asset: Asset, memo: str) -> str:
        """
        Executa transferência NFT na Stellar
        """
        try:
            from_keypair = Keypair.from_secret(from_secret)
            source_account = self.stellar.server.load_account(from_account)
            
            transaction = (
                TransactionBuilder(
                    source_account=source_account,
                    network_passphrase=self.stellar.network_passphrase,
                    base_fee=self.stellar.base_fee
                )
                .append_payment_op(
                    destination=to_account,
                    asset=nft_asset,
                    amount="1"
                )
                .add_text_memo(f"NFT-TRANSFER:{memo}")
                .set_timeout(30)
                .build()
            )
            
            transaction.sign(from_keypair)
            response = self.stellar.server.submit_transaction(transaction)
            
            return response['hash']
            
        except Exception as e:
            raise Exception(f"Erro na transferência NFT: {e}")
    
    def _ensure_trustline(self, account_key: str, asset: Asset):
        """
        Garante que conta tem trustline para o asset
        """
        # Em produção, verificaria se trustline já existe
        # e criaria apenas se necessário
        pass

# ========================= FACTORY E INICIALIZAÇÃO =========================

class StellarContractsManager:
    """
    Gerenciador principal dos contratos Stellar
    """
    
    def __init__(self):
        self.stellar = StellarContracts()
        self.watch_registration = WatchRegistrationContract(self.stellar)
        self.escrow = EscrowContract(self.stellar)
        self.nft = NFTContract(self.stellar)
    
    def get_watch_registration(self) -> WatchRegistrationContract:
        return self.watch_registration
    
    def get_escrow(self) -> EscrowContract:
        return self.escrow
    
    def get_nft(self) -> NFTContract:
        return self.nft

# Instância global
stellar_contracts = StellarContractsManager()
