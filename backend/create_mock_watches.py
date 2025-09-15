#!/usr/bin/env python3
"""
Script para criar relógios de mock na base de dados
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import get_db, engine
from app.models import Watch, Store, User
from datetime import datetime

# Dados dos relógios mock
MOCK_WATCHES = [
    {
        "serial_number": "RL001-SUB-2023",
        "brand": "Rolex",
        "model": "Submariner Date",
        "year": 2023,
        "condition": "novo",
        "description": "O icônico Rolex Submariner Date é um relógio de mergulho profissional que combina funcionalidade excepcional com elegância atemporal. Com resistência à água até 300 metros e movimento automático de última geração.",
        "purchase_price_brl": 120000.00,
        "current_value_brl": 125000.00,
        "price_brl": 125000.00,
        "status": "for_sale",
        "image_url": "/luxury-rolex-submariner.png"
    },
    {
        "serial_number": "PP002-NAU-2022",
        "brand": "Patek Philippe",
        "model": "Nautilus",
        "year": 2022,
        "condition": "seminovo",
        "description": "O Patek Philippe Nautilus é uma obra-prima da relojoaria suíça, reconhecido mundialmente por seu design elegante e movimento de alta complicação.",
        "purchase_price_brl": 280000.00,
        "current_value_brl": 320000.00,
        "price_brl": 320000.00,
        "status": "for_sale",
        "image_url": "/patek-philippe-nautilus-luxury-watch.png"
    },
    {
        "serial_number": "AP003-ROY-2023",
        "brand": "Audemars Piguet",
        "model": "Royal Oak",
        "year": 2023,
        "condition": "novo",
        "description": "O Audemars Piguet Royal Oak é um ícone do design octogonal, combinando materiais premium com artesanato excepcional.",
        "purchase_price_brl": 180000.00,
        "current_value_brl": 195000.00,
        "price_brl": 195000.00,
        "status": "for_sale",
        "image_url": "/audemars-piguet-royal-oak-luxury-watch.png"
    },
    {
        "serial_number": "OM004-SPE-2022",
        "brand": "Omega",
        "model": "Speedmaster Professional",
        "year": 2022,
        "condition": "seminovo",
        "description": "O Omega Speedmaster Professional, conhecido como o 'Moonwatch', é uma lenda que acompanhou os astronautas à lua.",
        "purchase_price_brl": 45000.00,
        "current_value_brl": 48000.00,
        "price_brl": 48000.00,
        "status": "for_sale",
        "image_url": "/omega-speedmaster-luxury-watch.png"
    },
    {
        "serial_number": "CA005-SAN-2023",
        "brand": "Cartier",
        "model": "Santos",
        "year": 2023,
        "condition": "novo",
        "description": "O Cartier Santos é um relógio pioneiro na aviação, com design distintivo e elegância parisiense inconfundível.",
        "purchase_price_brl": 65000.00,
        "current_value_brl": 68000.00,
        "price_brl": 68000.00,
        "status": "for_sale",
        "image_url": "/cartier-santos-luxury-watch.png"
    },
    {
        "serial_number": "BR006-NAV-2021",
        "brand": "Breitling",
        "model": "Navitimer",
        "year": 2021,
        "condition": "usado",
        "description": "O Breitling Navitimer é o relógio dos pilotos, com régua de cálculo circular e cronógrafo de precisão.",
        "purchase_price_brl": 35000.00,
        "current_value_brl": 38000.00,
        "price_brl": 38000.00,
        "status": "for_sale",
        "image_url": "/breitling-navitimer-luxury-watch.png"
    },
    {
        "serial_number": "IWC007-POR-2022",
        "brand": "IWC",
        "model": "Portugieser",
        "year": 2022,
        "condition": "seminovo",
        "description": "O IWC Portugieser combina elegância clássica com precisão técnica, representando o melhor da relojoaria suíça.",
        "purchase_price_brl": 75000.00,
        "current_value_brl": 78000.00,
        "price_brl": 78000.00,
        "status": "for_sale",
        "image_url": "/iwc-portugieser-luxury-watch.png"
    },
    {
        "serial_number": "CA008-TAN-2023",
        "brand": "Cartier",
        "model": "Tank",
        "year": 2023,
        "condition": "novo",
        "description": "O Cartier Tank é um ícone atemporal do design Art Déco, símbolo de elegância e sofisticação.",
        "purchase_price_brl": 55000.00,
        "current_value_brl": 58000.00,
        "price_brl": 58000.00,
        "status": "for_sale",
        "image_url": "/cartier-tank-luxury-watch.png"
    }
]

def create_mock_watches():
    """Cria relógios de mock na base de dados"""
    # Criar uma sessão de base de dados
    db = next(get_db())
    
    try:
        # Verificar se há uma loja para associar os relógios
        store = db.query(Store).first()
        if not store:
            print("Nenhuma loja encontrada. Criando loja de exemplo...")
            # Verificar se há um usuário para a loja
            user = db.query(User).filter(User.role == "store").first()
            if not user:
                print("Criando usuário loja de exemplo...")
                user = User(
                    full_name="Loja Premium Relógios",
                    email="loja@premium.com",
                    password_hash="$2b$12$dummy_hash",
                    role="store",
                    balance_brl=0.0,
                    balance_xlm=0.0
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            
            store = Store(
                user_id=user.id,
                name="Premium Timepieces",
                cnpj="12.345.678/0001-90",
                address="Rua dos Relógios, 123 - São Paulo, SP",
                phone="(11) 9999-8888",
                email="contato@premium.com",
                credentialed=True,
                commission_rate=0.05
            )
            db.add(store)
            db.commit()
            db.refresh(store)
        
        # Verificar relógios existentes
        existing_serials = {watch.serial_number for watch in db.query(Watch).all()}
        
        created_count = 0
        for watch_data in MOCK_WATCHES:
            if watch_data["serial_number"] in existing_serials:
                print(f"Relógio {watch_data['serial_number']} já existe, pulando...")
                continue
            
            watch = Watch(
                serial_number=watch_data["serial_number"],
                brand=watch_data["brand"],
                model=watch_data["model"],
                year=watch_data["year"],
                condition=watch_data["condition"],
                description=watch_data["description"],
                purchase_price_brl=watch_data["purchase_price_brl"],
                current_value_brl=watch_data["current_value_brl"],
                price_brl=watch_data["price_brl"],
                store_id=store.id,
                status=watch_data["status"],
                image_url=watch_data["image_url"]
            )
            
            db.add(watch)
            created_count += 1
            print(f"Criado: {watch_data['brand']} {watch_data['model']} ({watch_data['serial_number']})")
        
        db.commit()
        print(f"\n✅ Processo concluído! {created_count} relógios criados com sucesso.")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Criando relógios de mock na base de dados...")
    create_mock_watches()