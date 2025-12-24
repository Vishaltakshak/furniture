from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image: str
    images: List[str] = []
    dimensions: Optional[str] = None
    material: Optional[str] = None
    in_stock: bool = True
    featured: bool = False

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    image: str
    quantity: int

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[CartItemResponse] = []
    total: float = 0.0

class CustomerDetails(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str

class OrderCreate(BaseModel):
    customer: CustomerDetails
    cart_id: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer: CustomerDetails
    items: List[CartItemResponse]
    total: float
    status: str = "pending"
    payment_status: str = "unpaid"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ DUMMY DATA ============

DUMMY_PRODUCTS = [
    # Living Room
    {
        "id": "prod-1",
        "name": "Velvet Milano Sofa",
        "description": "Luxurious three-seater velvet sofa with gold-finished legs. Perfect centerpiece for any modern living room.",
        "price": 189999,
        "category": "living-room",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"],
        "dimensions": "220cm x 95cm x 85cm",
        "material": "Italian Velvet, Solid Teak Wood",
        "in_stock": True,
        "featured": True
    },
    {
        "id": "prod-2",
        "name": "Noir Coffee Table",
        "description": "Elegant black marble top coffee table with brushed brass frame. A statement piece for sophisticated interiors.",
        "price": 75999,
        "category": "living-room",
        "image": "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80"],
        "dimensions": "120cm x 60cm x 45cm",
        "material": "Black Marble, Brass",
        "in_stock": True,
        "featured": True
    },
    {
        "id": "prod-3",
        "name": "Accent Armchair",
        "description": "Mid-century modern accent chair with premium leather upholstery and walnut wood frame.",
        "price": 65999,
        "category": "living-room",
        "image": "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80"],
        "dimensions": "75cm x 80cm x 85cm",
        "material": "Premium Leather, Walnut Wood",
        "in_stock": True,
        "featured": False
    },
    {
        "id": "prod-4",
        "name": "Crystal Floor Lamp",
        "description": "Art deco inspired floor lamp with crystal accents and gold finish base.",
        "price": 45999,
        "category": "living-room",
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"],
        "dimensions": "180cm height",
        "material": "Crystal, Brass",
        "in_stock": True,
        "featured": False
    },
    # Bedroom
    {
        "id": "prod-5",
        "name": "Royal King Bed",
        "description": "Majestic king-size bed with tufted headboard in premium velvet. Gold-finished metal accents.",
        "price": 245999,
        "category": "bedroom",
        "image": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80"],
        "dimensions": "200cm x 210cm x 140cm",
        "material": "Velvet, Solid Oak",
        "in_stock": True,
        "featured": True
    },
    {
        "id": "prod-6",
        "name": "Ebony Nightstand",
        "description": "Sleek nightstand with soft-close drawers and black lacquer finish.",
        "price": 35999,
        "category": "bedroom",
        "image": "https://images.unsplash.com/photo-1551298370-9d3d53f3b9e9?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1551298370-9d3d53f3b9e9?w=800&q=80"],
        "dimensions": "50cm x 40cm x 55cm",
        "material": "MDF, Black Lacquer",
        "in_stock": True,
        "featured": False
    },
    {
        "id": "prod-7",
        "name": "Grand Wardrobe",
        "description": "Spacious wardrobe with mirrored doors and internal LED lighting. Customizable compartments.",
        "price": 185999,
        "category": "bedroom",
        "image": "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80"],
        "dimensions": "250cm x 60cm x 220cm",
        "material": "Engineered Wood, Mirror",
        "in_stock": True,
        "featured": False
    },
    {
        "id": "prod-8",
        "name": "Vanity Dresser",
        "description": "Hollywood-style vanity with LED mirror and velvet stool included.",
        "price": 95999,
        "category": "bedroom",
        "image": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80"],
        "dimensions": "120cm x 45cm x 150cm",
        "material": "Wood, LED Glass",
        "in_stock": True,
        "featured": False
    },
    # Office
    {
        "id": "prod-9",
        "name": "Executive Desk",
        "description": "Premium executive desk with leather inlay and built-in cable management.",
        "price": 165999,
        "category": "office",
        "image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80"],
        "dimensions": "180cm x 90cm x 75cm",
        "material": "Mahogany, Leather",
        "in_stock": True,
        "featured": True
    },
    {
        "id": "prod-10",
        "name": "Ergonomic Chair",
        "description": "High-back ergonomic office chair with lumbar support and premium leather.",
        "price": 85999,
        "category": "office",
        "image": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80"],
        "dimensions": "70cm x 70cm x 130cm",
        "material": "Premium Leather, Aluminum",
        "in_stock": True,
        "featured": False
    },
    {
        "id": "prod-11",
        "name": "Bookshelf Unit",
        "description": "Open bookshelf with brass frame and tempered glass shelves.",
        "price": 125999,
        "category": "office",
        "image": "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80"],
        "dimensions": "150cm x 35cm x 200cm",
        "material": "Brass, Tempered Glass",
        "in_stock": True,
        "featured": False
    },
    {
        "id": "prod-12",
        "name": "Filing Cabinet",
        "description": "Modern filing cabinet with 4 drawers and soft-close mechanism.",
        "price": 45999,
        "category": "office",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
        "dimensions": "50cm x 60cm x 120cm",
        "material": "Steel, Wood Veneer",
        "in_stock": True,
        "featured": False
    },
    # Dining
    {
        "id": "prod-13",
        "name": "Dining Table Set",
        "description": "8-seater dining table with marble top and matching upholstered chairs.",
        "price": 325999,
        "category": "dining",
        "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80"],
        "dimensions": "240cm x 100cm x 76cm",
        "material": "Marble, Velvet, Oak",
        "in_stock": True,
        "featured": True
    },
    {
        "id": "prod-14",
        "name": "Bar Cabinet",
        "description": "Art deco bar cabinet with mirrored interior and gold hardware.",
        "price": 145999,
        "category": "dining",
        "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
        "dimensions": "100cm x 45cm x 150cm",
        "material": "Walnut, Mirror, Brass",
        "in_stock": True,
        "featured": False
    },
    {
        "id": "prod-15",
        "name": "Dining Chairs (Set of 4)",
        "description": "Set of 4 velvet dining chairs with gold-finished legs.",
        "price": 89999,
        "category": "dining",
        "image": "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80"],
        "dimensions": "45cm x 50cm x 95cm each",
        "material": "Velvet, Gold Metal",
        "in_stock": True,
        "featured": False
    },
    {
        "id": "prod-16",
        "name": "Chandelier - Crystal",
        "description": "Grand crystal chandelier with 12 lights. Perfect for dining rooms.",
        "price": 195999,
        "category": "dining",
        "image": "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80",
        "images": ["https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80"],
        "dimensions": "80cm diameter x 100cm height",
        "material": "Crystal, Chrome",
        "in_stock": True,
        "featured": False
    }
]

# ============ PRODUCT ENDPOINTS ============

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None
):
    """Get all products with optional filtering"""
    products = DUMMY_PRODUCTS.copy()
    
    if category:
        products = [p for p in products if p["category"] == category]
    
    if min_price is not None:
        products = [p for p in products if p["price"] >= min_price]
    
    if max_price is not None:
        products = [p for p in products if p["price"] <= max_price]
    
    if search:
        search_lower = search.lower()
        products = [p for p in products if search_lower in p["name"].lower() or search_lower in p["description"].lower()]
    
    if featured is not None:
        products = [p for p in products if p["featured"] == featured]
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a single product by ID"""
    for product in DUMMY_PRODUCTS:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

@api_router.get("/categories")
async def get_categories():
    """Get all categories"""
    return [
        {"id": "living-room", "name": "Living Room", "image": "https://images.unsplash.com/photo-1653668984101-29088a7b5476?w=800&q=80"},
        {"id": "bedroom", "name": "Bedroom", "image": "https://images.unsplash.com/photo-1702865071772-16f67bbf594e?w=800&q=80"},
        {"id": "office", "name": "Office", "image": "https://images.unsplash.com/photo-1704655295066-681e61ecca6b?w=800&q=80"},
        {"id": "dining", "name": "Dining", "image": "https://images.unsplash.com/photo-1649747823135-3450d7b8fa41?w=800&q=80"}
    ]

# ============ CART ENDPOINTS ============

# In-memory cart storage (would use MongoDB in production)
carts = {}

@api_router.post("/cart/create", response_model=Cart)
async def create_cart():
    """Create a new cart"""
    cart = Cart()
    carts[cart.id] = cart.model_dump()
    return cart

@api_router.get("/cart/{cart_id}", response_model=Cart)
async def get_cart(cart_id: str):
    """Get cart by ID"""
    if cart_id not in carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    return carts[cart_id]

@api_router.post("/cart/{cart_id}/add")
async def add_to_cart(cart_id: str, item: CartItem):
    """Add item to cart"""
    if cart_id not in carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Find product
    product = None
    for p in DUMMY_PRODUCTS:
        if p["id"] == item.product_id:
            product = p
            break
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    cart = carts[cart_id]
    
    # Check if item already in cart
    for cart_item in cart["items"]:
        if cart_item["product_id"] == item.product_id:
            cart_item["quantity"] += item.quantity
            break
    else:
        cart["items"].append({
            "product_id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "image": product["image"],
            "quantity": item.quantity
        })
    
    # Recalculate total
    cart["total"] = sum(i["price"] * i["quantity"] for i in cart["items"])
    
    return cart

@api_router.post("/cart/{cart_id}/remove")
async def remove_from_cart(cart_id: str, product_id: str):
    """Remove item from cart"""
    if cart_id not in carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = carts[cart_id]
    cart["items"] = [i for i in cart["items"] if i["product_id"] != product_id]
    cart["total"] = sum(i["price"] * i["quantity"] for i in cart["items"])
    
    return cart

@api_router.post("/cart/{cart_id}/update")
async def update_cart_quantity(cart_id: str, item: CartItem):
    """Update item quantity in cart"""
    if cart_id not in carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = carts[cart_id]
    
    for cart_item in cart["items"]:
        if cart_item["product_id"] == item.product_id:
            if item.quantity <= 0:
                cart["items"].remove(cart_item)
            else:
                cart_item["quantity"] = item.quantity
            break
    
    cart["total"] = sum(i["price"] * i["quantity"] for i in cart["items"])
    
    return cart

# ============ ORDER ENDPOINTS ============

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """Create a new order"""
    if order_data.cart_id not in carts:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart = carts[order_data.cart_id]
    
    if not cart["items"]:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    order = Order(
        customer=order_data.customer,
        items=cart["items"],
        total=cart["total"]
    )
    
    # Save to MongoDB
    order_dict = order.model_dump()
    await db.orders.insert_one(order_dict)
    
    # Clear cart
    carts[order_data.cart_id]["items"] = []
    carts[order_data.cart_id]["total"] = 0
    
    return order

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    """Get order by ID"""
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ============ RAZORPAY READY ENDPOINTS (DISABLED) ============

# Uncomment and configure when ready to accept payments
# RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
# RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')
# razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

class PaymentOrder(BaseModel):
    amount: int  # Amount in paise
    currency: str = "INR"
    order_id: str

@api_router.post("/payment/create-order")
async def create_payment_order(payment: PaymentOrder):
    """Create Razorpay order - Currently disabled"""
    # When Razorpay is enabled:
    # razor_order = razorpay_client.order.create({
    #     "amount": payment.amount,
    #     "currency": payment.currency,
    #     "payment_capture": 1,
    #     "notes": {"order_id": payment.order_id}
    # })
    # return razor_order
    
    return {
        "message": "Payment integration not enabled",
        "order_id": payment.order_id,
        "amount": payment.amount
    }

@api_router.post("/payment/verify")
async def verify_payment(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
    order_id: str
):
    """Verify Razorpay payment - Currently disabled"""
    # When Razorpay is enabled:
    # try:
    #     razorpay_client.utility.verify_payment_signature({
    #         'razorpay_order_id': razorpay_order_id,
    #         'razorpay_payment_id': razorpay_payment_id,
    #         'razorpay_signature': razorpay_signature
    #     })
    #     # Update order status
    #     await db.orders.update_one(
    #         {"id": order_id},
    #         {"$set": {"payment_status": "paid", "status": "confirmed"}}
    #     )
    #     return {"status": "success"}
    # except:
    #     raise HTTPException(status_code=400, detail="Payment verification failed")
    
    return {"message": "Payment verification not enabled"}

# ============ EXISTING ENDPOINTS ============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "Lumière Furniture API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
