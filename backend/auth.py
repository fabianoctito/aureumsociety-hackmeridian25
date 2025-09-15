from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os

SECRET_KEY = os.getenv("JWT_SECRET", "secreto_super_seguro")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        # Validar formato do token
        if not token or not isinstance(token, str) or len(token.strip()) < 10:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
        
        # Decodificar e validar
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Validar campos obrigatórios
        if not payload.get("sub") or not payload.get("role"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token malformado")
        
        # Validar expiração explicitamente
        exp = payload.get("exp")
        if not exp or datetime.fromtimestamp(exp) < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
            
        return payload
        
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token inválido")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Erro na validação do token")

def require_role(required_roles):
    def role_checker(token: str = Depends(oauth2_scheme)):
        # Validar se token foi fornecido
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de acesso obrigatório")
        
        # Decodificar token
        payload = decode_token(token)
        
        # Validar role
        user_role = payload.get("role")
        if not user_role:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Role não encontrado no token")
            
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Acesso negado. Roles necessários: {required_roles}"
            )
        
        return payload
    return role_checker
