from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Header, Query
from fastapi.responses import Response as FastAPIResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)

# ---------- Config ----------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@zenkai.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "sk_test_emergent")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "zenkai")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Zenkai API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("zenkai")

# ---------- Storage ----------
storage_key: Optional[str] = None

def init_storage() -> Optional[str]:
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        return None
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        r.raise_for_status()
        storage_key = r.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.warning(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(503, "Storage unavailable")
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    r.raise_for_status()
    return r.json()

def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(503, "Storage unavailable")
    r = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")

# ---------- Auth helpers ----------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False

def create_access_token(uid: str, email: str, role: str) -> str:
    payload = {"sub": uid, "email": email, "role": role,
               "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def create_refresh_token(uid: str) -> str:
    payload = {"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def set_auth_cookies(resp: Response, access: str, refresh: str):
    resp.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=86400, path="/")
    resp.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user

# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProductIn(BaseModel):
    name: str
    description: str = ""
    price: float
    category: str  # acrylic_plaques | led_frames | posters | manga_canvas | neon_collectibles
    images: List[str] = []
    stock: int = 10
    anime: str = ""
    tags: List[str] = []
    featured: bool = False
    trending: bool = False
    best_seller: bool = False
    new_arrival: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    anime: Optional[str] = None
    tags: Optional[List[str]] = None
    featured: Optional[bool] = None
    trending: Optional[bool] = None
    best_seller: Optional[bool] = None
    new_arrival: Optional[bool] = None

class CartItemIn(BaseModel):
    product_id: str
    quantity: int = 1

class CheckoutIn(BaseModel):
    origin_url: str
    shipping_address: Optional[Dict[str, Any]] = None

# ---------- Auth Endpoints ----------
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    user = {
        "id": uid, "email": email, "name": body.name,
        "password_hash": hash_password(body.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    set_auth_cookies(response, create_access_token(uid, email, "user"), create_refresh_token(uid))
    return {"id": uid, "email": email, "name": body.name, "role": "user"}

@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    set_auth_cookies(response, create_access_token(user["id"], email, user["role"]), create_refresh_token(user["id"]))
    return {"id": user["id"], "email": email, "name": user["name"], "role": user["role"]}

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(401, "User not found")
        new_access = create_access_token(user["id"], user["email"], user["role"])
        response.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="none", max_age=86400, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ---------- Products ----------
def clean(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc

@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    trending: Optional[bool] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    limit: int = 100,
):
    q: Dict[str, Any] = {}
    if category:
        q["category"] = category
    if search:
        q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"anime": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    if featured is not None:
        q["featured"] = featured
    if trending is not None:
        q["trending"] = trending
    if best_seller is not None:
        q["best_seller"] = best_seller
    if new_arrival is not None:
        q["new_arrival"] = new_arrival
    items = await db.products.find(q, {"_id": 0}).limit(limit).to_list(limit)
    return items

@api.get("/products/categories")
async def categories():
    return [
        {"slug": "acrylic_plaques", "name": "Acrylic Plaques",
         "image": "https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/83d21692e93a35182f05af6ad6e3efd4f99908f1ff94571b76e8873bd59ac7c1.png",
         "description": "Glowing neon characters etched in premium acrylic"},
        {"slug": "led_frames", "name": "LED Frames",
         "image": "https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/d41d9a539d2d4f74a1654003c0e314f321acc88ef8f948c42448d87bb0bad174.png",
         "description": "Illuminated lightbox frames with vivid anime art"},
        {"slug": "posters", "name": "Posters",
         "image": "https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
         "description": "Premium printed anime poster art"},
        {"slug": "manga_canvas", "name": "Manga Canvas",
         "image": "https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/b59b626859771bee1503c787825a46513d538dbe0c270fb9cf070bac537d0628.png",
         "description": "High-contrast manga panel canvases"},
        {"slug": "neon_collectibles", "name": "Neon Collectibles",
         "image": "https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/e72d2dbaf377ff55f1e825bab3ba944992d7e342b8f27b43662c46d522f79ee2.png",
         "description": "Detailed figures in glowing display cases"},
    ]

@api.get("/products/{pid}")
async def get_product(pid: str):
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    return p

@api.post("/products")
async def create_product(body: ProductIn, _: dict = Depends(require_admin)):
    pid = str(uuid.uuid4())
    doc = {**body.model_dump(), "id": pid, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.products.insert_one(doc)
    return clean(doc)

@api.put("/products/{pid}")
async def update_product(pid: str, body: ProductUpdate, _: dict = Depends(require_admin)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No updates provided")
    res = await db.products.update_one({"id": pid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    p = await db.products.find_one({"id": pid}, {"_id": 0})
    return p

@api.delete("/products/{pid}")
async def delete_product(pid: str, _: dict = Depends(require_admin)):
    res = await db.products.delete_one({"id": pid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}

# ---------- Upload ----------
@api.post("/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(require_admin)):
    ext = (file.filename or "img.png").split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "gif", "webp"]:
        raise HTTPException(400, "Unsupported image type")
    path = f"{APP_NAME}/products/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "image/png")
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "uploaded_by": user["id"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}

@api.get("/files/{path:path}")
async def get_file(path: str):
    data, ct = get_object(path)
    return FastAPIResponse(content=data, media_type=ct)

# ---------- Cart ----------
@api.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["id"]}, {"_id": 0})
    if not cart:
        cart = {"user_id": user["id"], "items": []}
    # enrich with product details
    items = []
    for it in cart.get("items", []):
        p = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
        if p:
            items.append({**it, "product": p})
    return {"items": items}

@api.post("/cart")
async def add_to_cart(body: CartItemIn, user: dict = Depends(get_current_user)):
    p = await db.products.find_one({"id": body.product_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    cart = await db.carts.find_one({"user_id": user["id"]})
    if not cart:
        await db.carts.insert_one({"user_id": user["id"], "items": [{"product_id": body.product_id, "quantity": body.quantity}]})
    else:
        items = cart.get("items", [])
        found = False
        for it in items:
            if it["product_id"] == body.product_id:
                it["quantity"] += body.quantity
                found = True
                break
        if not found:
            items.append({"product_id": body.product_id, "quantity": body.quantity})
        await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": items}})
    return {"ok": True}

@api.put("/cart/{pid}")
async def update_cart_item(pid: str, body: CartItemIn, user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["id"]})
    if not cart:
        raise HTTPException(404, "Cart empty")
    items = [it for it in cart["items"] if it["product_id"] != pid]
    if body.quantity > 0:
        items.append({"product_id": pid, "quantity": body.quantity})
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": items}})
    return {"ok": True}

@api.delete("/cart/{pid}")
async def remove_from_cart(pid: str, user: dict = Depends(get_current_user)):
    await db.carts.update_one({"user_id": user["id"]}, {"$pull": {"items": {"product_id": pid}}})
    return {"ok": True}

@api.delete("/cart")
async def clear_cart(user: dict = Depends(get_current_user)):
    await db.carts.update_one({"user_id": user["id"]}, {"$set": {"items": []}})
    return {"ok": True}

# ---------- Wishlist ----------
@api.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    w = await db.wishlists.find_one({"user_id": user["id"]}, {"_id": 0})
    ids = (w or {}).get("product_ids", [])
    products = await db.products.find({"id": {"$in": ids}}, {"_id": 0}).to_list(1000)
    return {"product_ids": ids, "products": products}

@api.post("/wishlist/{pid}")
async def toggle_wishlist(pid: str, user: dict = Depends(get_current_user)):
    w = await db.wishlists.find_one({"user_id": user["id"]})
    if not w:
        await db.wishlists.insert_one({"user_id": user["id"], "product_ids": [pid]})
        return {"added": True}
    ids = w.get("product_ids", [])
    if pid in ids:
        ids.remove(pid)
        await db.wishlists.update_one({"user_id": user["id"]}, {"$set": {"product_ids": ids}})
        return {"added": False}
    ids.append(pid)
    await db.wishlists.update_one({"user_id": user["id"]}, {"$set": {"product_ids": ids}})
    return {"added": True}

# ---------- Stripe Checkout ----------
@api.post("/checkout/session")
async def create_checkout(body: CheckoutIn, request: Request, user: dict = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": user["id"]})
    if not cart or not cart.get("items"):
        raise HTTPException(400, "Cart is empty")
    # Compute amount on backend ONLY
    total = 0.0
    line_summary = []
    for it in cart["items"]:
        p = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
        if not p:
            continue
        total += float(p["price"]) * int(it["quantity"])
        line_summary.append(f"{p['name']} x{it['quantity']}")
    if total <= 0:
        raise HTTPException(400, "Invalid total")
    total = round(total, 2)

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    origin = body.origin_url.rstrip("/")
    success_url = f"{origin}/order/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/cart"

    req = CheckoutSessionRequest(
        amount=total,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user["id"], "email": user["email"]},
    )
    session = await stripe.create_checkout_session(req)

    order_id = str(uuid.uuid4())
    await db.payment_transactions.insert_one({
        "id": order_id,
        "session_id": session.session_id,
        "user_id": user["id"],
        "email": user["email"],
        "amount": total,
        "currency": "usd",
        "items": cart["items"],
        "summary": line_summary,
        "shipping_address": body.shipping_address,
        "payment_status": "initiated",
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.session_id}

@api.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe.get_checkout_status(session_id)
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if tx and tx["payment_status"] != status.payment_status:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status}},
        )
        if status.payment_status == "paid" and tx.get("payment_status") != "paid":
            # Create an order and clear cart (idempotent)
            await db.orders.insert_one({
                "id": tx["id"],
                "user_id": tx["user_id"],
                "email": tx["email"],
                "amount": tx["amount"],
                "items": tx["items"],
                "summary": tx["summary"],
                "shipping_address": tx.get("shipping_address"),
                "status": "paid",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            await db.carts.update_one({"user_id": tx["user_id"]}, {"$set": {"items": []}})
    return {
        "payment_status": status.payment_status,
        "status": status.status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }

@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    try:
        ev = await stripe.handle_webhook(body, request.headers.get("Stripe-Signature"))
        await db.payment_transactions.update_one(
            {"session_id": ev.session_id},
            {"$set": {"payment_status": ev.payment_status}},
        )
    except Exception as e:
        logger.warning(f"Webhook err: {e}")
    return {"ok": True}

# ---------- Orders ----------
@api.get("/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return orders

@api.get("/orders/{oid}")
async def get_order(oid: str, user: dict = Depends(get_current_user)):
    o = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Order not found")
    if user.get("role") != "admin" and o["user_id"] != user["id"]:
        raise HTTPException(403, "Forbidden")
    return o

# ---------- Admin ----------
@api.get("/admin/orders")
async def admin_orders(_: dict = Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@api.get("/admin/analytics")
async def admin_analytics(_: dict = Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    total_revenue = round(sum(float(o.get("amount", 0)) for o in orders), 2)
    total_orders = len(orders)
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({"role": "user"})
    # Revenue by category
    cat_revenue: Dict[str, float] = {}
    for o in orders:
        for it in o.get("items", []):
            p = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
            if p:
                cat_revenue[p["category"]] = cat_revenue.get(p["category"], 0) + float(p["price"]) * int(it["quantity"])
    # Recent orders
    recent = sorted(orders, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_users": total_users,
        "revenue_by_category": [{"category": k, "revenue": round(v, 2)} for k, v in cat_revenue.items()],
        "recent_orders": recent,
    }

# ---------- Newsletter ----------
class NewsletterIn(BaseModel):
    email: EmailStr

@api.post("/newsletter")
async def newsletter(body: NewsletterIn):
    existing = await db.newsletter.find_one({"email": body.email.lower()})
    if existing:
        return {"ok": True, "already": True}
    await db.newsletter.insert_one({
        "id": str(uuid.uuid4()),
        "email": body.email.lower(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True}

# ---------- Seed ----------
SEED_PRODUCTS = [
    {"name": "Demon Slayer Tanjiro Acrylic Plaque", "anime": "Demon Slayer", "category": "acrylic_plaques", "price": 39.99, "stock": 20, "tags": ["tanjiro","demon slayer","plaque"], "featured": True, "trending": True, "best_seller": True, "new_arrival": False,
     "description": "A stunning hand-finished acrylic plaque featuring Tanjiro with deep neon engraving and LED-ready base.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/83d21692e93a35182f05af6ad6e3efd4f99908f1ff94571b76e8873bd59ac7c1.png"]},
    {"name": "Naruto Sage Mode Acrylic Plaque", "anime": "Naruto", "category": "acrylic_plaques", "price": 44.99, "stock": 18, "tags": ["naruto","sage"], "featured": False, "trending": True, "best_seller": False, "new_arrival": True,
     "description": "Naruto in Sage Mode etched into premium 12mm acrylic. Glows under any LED base.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/83d21692e93a35182f05af6ad6e3efd4f99908f1ff94571b76e8873bd59ac7c1.png"]},
    {"name": "Attack On Titan Levi Plaque", "anime": "Attack on Titan", "category": "acrylic_plaques", "price": 42.50, "stock": 12, "tags": ["levi","aot"], "featured": True, "trending": False, "best_seller": True, "new_arrival": False,
     "description": "Captain Levi mid-strike in laser-etched glass-clear acrylic with RGB base.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/83d21692e93a35182f05af6ad6e3efd4f99908f1ff94571b76e8873bd59ac7c1.png"]},
    {"name": "Jujutsu Kaisen Gojo LED Frame", "anime": "Jujutsu Kaisen", "category": "led_frames", "price": 89.99, "stock": 10, "tags": ["gojo","jjk"], "featured": True, "trending": True, "best_seller": True, "new_arrival": True,
     "description": "Backlit LED lightbox poster of Gojo with infinity domain. USB powered.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/d41d9a539d2d4f74a1654003c0e314f321acc88ef8f948c42448d87bb0bad174.png"]},
    {"name": "One Piece Luffy Gear 5 LED Frame", "anime": "One Piece", "category": "led_frames", "price": 94.00, "stock": 7, "tags": ["luffy","one piece"], "featured": False, "trending": True, "best_seller": False, "new_arrival": True,
     "description": "Gear 5 Luffy in vibrant transparency, backlit by an ultra-thin LED chassis.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/d41d9a539d2d4f74a1654003c0e314f321acc88ef8f948c42448d87bb0bad174.png"]},
    {"name": "Cyberpunk Edgerunners LED Frame", "anime": "Edgerunners", "category": "led_frames", "price": 99.50, "stock": 6, "tags": ["edgerunners","cyberpunk"], "featured": True, "trending": False, "best_seller": True, "new_arrival": False,
     "description": "David & Lucy under Night City neon — premium LED diffusion panel.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/d41d9a539d2d4f74a1654003c0e314f321acc88ef8f948c42448d87bb0bad174.png"]},
    {"name": "Spy x Family Anya Poster", "anime": "Spy x Family", "category": "posters", "price": 14.99, "stock": 40, "tags": ["anya","spy x family"], "featured": False, "trending": True, "best_seller": True, "new_arrival": False,
     "description": "Glossy 300gsm premium poster, framed-ready. 18x24in.",
     "images": ["https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"]},
    {"name": "Chainsaw Man Denji Poster", "anime": "Chainsaw Man", "category": "posters", "price": 16.50, "stock": 35, "tags": ["denji","chainsaw"], "featured": True, "trending": True, "best_seller": False, "new_arrival": True,
     "description": "Bold ink-style Denji poster with neon overlay finish.",
     "images": ["https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"]},
    {"name": "Solo Leveling Sung Jinwoo Poster", "anime": "Solo Leveling", "category": "posters", "price": 17.99, "stock": 30, "tags": ["solo leveling","jinwoo"], "featured": False, "trending": False, "best_seller": False, "new_arrival": True,
     "description": "Shadow Monarch ascended. Matte premium finish.",
     "images": ["https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"]},
    {"name": "Berserk Guts Manga Canvas", "anime": "Berserk", "category": "manga_canvas", "price": 59.99, "stock": 8, "tags": ["berserk","guts"], "featured": True, "trending": False, "best_seller": True, "new_arrival": False,
     "description": "Iconic black & white Guts canvas, 24x36in, museum stretched.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/b59b626859771bee1503c787825a46513d538dbe0c270fb9cf070bac537d0628.png"]},
    {"name": "Vagabond Musashi Canvas", "anime": "Vagabond", "category": "manga_canvas", "price": 62.00, "stock": 5, "tags": ["vagabond","musashi"], "featured": False, "trending": True, "best_seller": False, "new_arrival": True,
     "description": "Brush-style Musashi panel reproduced in cinematic 30x40in.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/b59b626859771bee1503c787825a46513d538dbe0c270fb9cf070bac537d0628.png"]},
    {"name": "Death Note L Canvas", "anime": "Death Note", "category": "manga_canvas", "price": 54.99, "stock": 9, "tags": ["death note","L"], "featured": True, "trending": False, "best_seller": True, "new_arrival": False,
     "description": "Detective L in moody chiaroscuro, ultra-fine ink canvas.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/b59b626859771bee1503c787825a46513d538dbe0c270fb9cf070bac537d0628.png"]},
    {"name": "Mecha Pilot Neon Figurine", "anime": "Evangelion", "category": "neon_collectibles", "price": 129.99, "stock": 5, "tags": ["eva","mecha","figure"], "featured": True, "trending": True, "best_seller": True, "new_arrival": False,
     "description": "Limited edition mecha pilot figure inside a neon-lit display dome.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/e72d2dbaf377ff55f1e825bab3ba944992d7e342b8f27b43662c46d522f79ee2.png"]},
    {"name": "Sailor Moon Neon Display Cube", "anime": "Sailor Moon", "category": "neon_collectibles", "price": 79.99, "stock": 10, "tags": ["sailor moon","neon"], "featured": False, "trending": True, "best_seller": False, "new_arrival": True,
     "description": "Animated neon strip cube celebrating Moonlight Densetsu.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/e72d2dbaf377ff55f1e825bab3ba944992d7e342b8f27b43662c46d522f79ee2.png"]},
    {"name": "Akira Capsule Neon Lamp", "anime": "Akira", "category": "neon_collectibles", "price": 109.00, "stock": 4, "tags": ["akira","kaneda"], "featured": True, "trending": False, "best_seller": True, "new_arrival": True,
     "description": "Kaneda's bike inspired neon capsule lamp — desk centerpiece.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/e72d2dbaf377ff55f1e825bab3ba944992d7e342b8f27b43662c46d522f79ee2.png"]},
    {"name": "Tokyo Ghoul Kaneki Plaque", "anime": "Tokyo Ghoul", "category": "acrylic_plaques", "price": 41.00, "stock": 14, "tags": ["kaneki","tokyo ghoul"], "featured": False, "trending": True, "best_seller": False, "new_arrival": True,
     "description": "Kaneki with kagune unleashed in clear acrylic.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/83d21692e93a35182f05af6ad6e3efd4f99908f1ff94571b76e8873bd59ac7c1.png"]},
    {"name": "My Hero Academia Deku LED Frame", "anime": "My Hero Academia", "category": "led_frames", "price": 84.99, "stock": 8, "tags": ["deku","mha"], "featured": False, "trending": False, "best_seller": True, "new_arrival": False,
     "description": "Deku in full cowling — backlit LED art.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/d41d9a539d2d4f74a1654003c0e314f321acc88ef8f948c42448d87bb0bad174.png"]},
    {"name": "Bleach Ichigo Bankai Poster", "anime": "Bleach", "category": "posters", "price": 15.99, "stock": 25, "tags": ["bleach","ichigo"], "featured": False, "trending": False, "best_seller": True, "new_arrival": False,
     "description": "Bankai-form Ichigo against a moonlit cityscape.",
     "images": ["https://images.pexels.com/photos/8108594/pexels-photo-8108594.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"]},
    {"name": "Hunter x Hunter Killua Canvas", "anime": "Hunter x Hunter", "category": "manga_canvas", "price": 57.50, "stock": 7, "tags": ["killua","hxh"], "featured": False, "trending": True, "best_seller": False, "new_arrival": False,
     "description": "Killua in godspeed — high-contrast ink canvas.",
     "images": ["https://static.prod-images.emergentagent.com/jobs/b26368f1-ca8e-41bf-a482-f17727a0d107/images/b59b626859771bee1503c787825a46513d538dbe0c270fb9cf070bac537d0628.png"]},
]

async def seed_data():
    # admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "name": "Zenkai Admin",
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL.lower()}, {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Admin password updated")
    # products
    count = await db.products.count_documents({})
    if count == 0:
        for p in SEED_PRODUCTS:
            doc = {**p, "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
            await db.products.insert_one(doc)
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")

@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("id", unique=True)
    await seed_data()
    init_storage()
    logger.info("Zenkai backend ready")

@app.on_event("shutdown")
async def on_shutdown():
    client.close()

# ---------- Health ----------
@api.get("/")
async def root():
    return {"name": "Zenkai API", "tagline": "Power Your Anime World"}

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
