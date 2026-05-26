# import json
# import os
# import random
# import uuid
# from datetime import datetime, timedelta, timezone
# from typing import List

# # Unsplash URLs: w=600&fit=crop keeps payloads small; each row uses only images for that product type.
# def u(photo_id: str) -> str:
#     return f"https://images.unsplash.com/photo-{photo_id}?w=600&fit=crop"


# SAMPLE_SELLERS = [
#     {"id": str(uuid.uuid4()), "name": "Avery Parks"},
#     {"id": str(uuid.uuid4()), "name": "Jordan Lee"},
#     {"id": str(uuid.uuid4()), "name": "Morgan Blake"},
#     {"id": str(uuid.uuid4()), "name": "Riley Quinn"},
#     {"id": str(uuid.uuid4()), "name": "Taylor Brooks"},
# ]

# # One template per listing family: description and images always match the title theme.
# LISTING_TEMPLATES = [
#     {
#         "name": "Wireless Headphones",
#         "description": (
#             "Over-ear wireless headphones with deep bass and a comfortable padded headband. "
#             "Bluetooth 5.x pairing, long battery life for commutes, and built-in controls for volume "
#             "and calls. Fold-flat design for travel."
#         ),
#         "images": [
#             u("1505740420928-5e560c06d30e"),
#             u("1484704849700-f032a568e944"),
#             u("1546431310-14b15c753a1a"),
#         ],
#     },
#     {
#         "name": "Running Shoes",
#         "description": (
#             "Lightweight running shoes with breathable mesh uppers and cushioned midsoles for road miles. "
#             "Durable rubber outsole for grip in wet conditions. True-to-size fit; ideal for training and daily wear."
#         ),
#         "images": [
#             u("1491553895911-0055eca6402d"),
#             u("1606107557195-0e29a4b5b4aa"),
#             u("1542291026-7eec264c27ff"),
#         ],
#     },
#     {
#         "name": "Coffee Maker",
#         "description": (
#             "Programmable drip coffee maker for full pots or smaller batches. Reusable filter basket, "
#             "pause-and-pour mid-brew, and warming plate. Compact footprint for kitchens with limited counter space."
#         ),
#         "images": [
#             u("1608043152269-423dbba4e7e1"),
#             u("1495474472287-4d71bcdd2085"),
#             u("1511920170033-f8396924c348"),
#         ],
#     },
#     {
#         "name": "Yoga Mat",
#         "description": (
#             "Non-slip exercise mat with extra thickness for knees and wrists during yoga or pilates. "
#             "Easy to clean surface; rolls up with a carry strap. Works on hardwood, tile, or carpet."
#         ),
#         "images": [
#             u("1601925260368-ae2f83cf8b7f"),
#             u("1544367567-0f2fcb009e0b"),
#             u("1599901860904-17e82ed8c98a"),
#         ],
#     },
#     {
#         "name": "Backpack",
#         "description": (
#             "Daypack with padded laptop sleeve, organizer pockets, and water-bottle side pockets. "
#             "Ventilated back panel and adjustable straps for commuting, campus, or weekend trips."
#         ),
#         "images": [
#             u("1546938576-6e3d5229e153"),
#             u("1553062407-98eeb64c6a62"),
#             u("1622560480602-0abc5c5d67b1"),
#         ],
#     },
#     {
#         "name": "Sunglasses",
#         "description": (
#             "Polarized lenses to cut road and water glare; lightweight frames with spring hinges. "
#             "Includes a microfiber pouch. UV400 protection for bright summer days."
#         ),
#         "images": [
#             u("1572635196237-14b3f281503f"),
#             u("1511499761310-c02616d174a"),
#             u("1473496169903-1e8ff5bd1146"),
#         ],
#     },
#     {
#         "name": "Smartwatch",
#         "description": (
#             "Fitness-focused smartwatch with heart-rate tracking, sleep stats, and workout modes. "
#             "Bright always-on display option and quick-change bands. Syncs with your phone for notifications."
#         ),
#         "images": [
#             u("1523275335684-37898b6baf30"),
#             u("1585399000684-d2f72d3c1a1b"),
#             u("1434493789842-d38a680e0861"),
#         ],
#     },
#     {
#         "name": "Blender",
#         "description": (
#             "Countertop blender for smoothies, soups, and frozen drinks. Sturdy glass or BPA-free jar, "
#             "multiple speeds plus pulse, and dishwasher-safe removable parts."
#         ),
#         "images": [
#             u("1547949003-9792a18a2601"),
#             u("1556911220-e15c29d3a23a"),
#             u("1511920170033-f8396924c348"),
#         ],
#     },
#     {
#         "name": "Desk Lamp",
#         "description": (
#             "Adjustable LED desk lamp with dimming and color temperature control. USB charging port in the base; "
#             "articulating arm for reading, drafting, or video calls without screen glare."
#         ),
#         "images": [
#             u("1558618666-fcd25c85cd64"),
#             u("1513506003901-1e6be229e171"),
#             u("1504196604752-acf2914ee2ea"),
#         ],
#     },
#     {
#         "name": "Mechanical Keyboard",
#         "description": (
#             "Mechanical keyboard with tactile switches, per-key RGB backlighting, and a solid aluminum frame. "
#             "USB-C detachable cable; includes extra keycaps for customization."
#         ),
#         "images": [
#             u("1601933470096-0e34634ffcde"),
#             u("1587825140428-d25e039b55d6"),
#             u("1618384887929-22f9034d2f58"),
#         ],
#     },
#     {
#         "name": "Water Bottle",
#         "description": (
#             "Insulated stainless steel bottle that keeps drinks cold for hours. Leak-proof flip lid, "
#             "wide mouth for ice, and powder-coated finish. Fits standard car cup holders."
#         ),
#         "images": [
#             u("1567538096630-e0c55bd6374c"),
#             u("1602143407151-7111542de6e8"),
#             u("1523362628749-0ef896b2e6b0"),
#         ],
#     },
#     {
#         "name": "Notebook",
#         "description": (
#             "Hardcover dot-grid notebook for bullet journaling, sketches, or meeting notes. "
#             "Lay-flat binding, thick bleed-resistant pages, and ribbon bookmark."
#         ),
#         "images": [
#             u("1512820790803-83ca734da794"),
#             u("1544716278-ca5e2d66a8d8"),
#             u("1455390582262-044c43f20160"),
#         ],
#     },
#     {
#         "name": "Phone Stand",
#         "description": (
#             "Adjustable phone stand for desk or nightstand: stable base, angle tilt, and cable pass-through. "
#             "Works with cases; folds flat for travel."
#         ),
#         "images": [
#             u("1611532736597-de2d4265fba3"),
#             u("1580894907863-bf28c732d878"),
#             u("1523205771623-e0faa29d1f0d"),
#         ],
#     },
#     {
#         "name": "USB Hub",
#         "description": (
#             "Powered USB hub with multiple high-speed ports for keyboards, drives, and accessories. "
#             "Compact design; includes data and optional charging support for laptops with limited ports."
#         ),
#         "images": [
#             u("1625842268584-8f3296236271"),
#             u("1593640408188-31b5c1f9343f"),
#             u("1587825140428-d25e039b55d6"),
#         ],
#     },
#     {
#         "name": "Portable Charger",
#         "description": (
#             "High-capacity power bank with fast charging for phones and tablets. LED fuel gauge, "
#             "multiple output ports, and travel-safe build for flights and long days out."
#         ),
#         "images": [
#             u("1609091759318-0111712696ac"),
#             u("1620712944536-1e224d0d8b5c"),
#             u("1583394838335-18d1a2d0e68e"),
#         ],
#     },
#     {
#         "name": "Canvas Print",
#         "description": (
#             "Gallery-wrapped canvas wall art, ready to hang with pre-installed hooks. "
#             "Fade-resistant inks; adds color and texture to living rooms, bedrooms, or offices."
#         ),
#         "images": [
#             u("1513519245088-0e12902e5a38"),
#             u("1549887532-28acab19e3c8"),
#             u("1513364776144-60967b0f8007"),
#         ],
#     },
#     {
#         "name": "Throw Pillow",
#         "description": (
#             "Decorative throw pillow with soft cover and plush insert. Hidden zipper for washing the cover; "
#             "mix and match sizes for sofas, reading nooks, or beds."
#         ),
#         "images": [
#             u("1584100655661-444f22b7fe32"),
#             u("1555041469-a586c61ea9bc"),
#             u("1503600342454-701597a31a8e"),
#         ],
#     },
#     {
#         "name": "Scented Candle",
#         "description": (
#             "Soy-blend scented candle in a reusable glass jar. Even melt pool, cotton wick, and long burn time. "
#             "Ideal for unwinding after work or setting a cozy mood."
#         ),
#         "images": [
#             u("1512499617640-c74ae3a79d37"),
#             u("1602145937656-594c9a5582d9"),
#             u("1507003211169-0a1dd7228f2d"),
#         ],
#     },
#     {
#         "name": "Plant Pot",
#         "description": (
#             "Ceramic planter with drainage hole and matching saucer for indoor herbs or houseplants. "
#             "Matte finish; sized for shelves, desks, or sunny windowsills."
#         ),
#         "images": [
#             u("1620799140408-edc6dcb6d633"),
#             u("1485955900006-10f4d324d419"),
#             u("1416879595880-00e7cebecbc6"),
#         ],
#     },
#     {
#         "name": "Wall Clock",
#         "description": (
#             "Silent quartz wall clock with easy-to-read numerals and a slim bezel. Battery operated; "
#             "lightweight for easy hanging in kitchens, offices, or entryways."
#         ),
#         "images": [
#             u("1507473885765-e6ed057f782c"),
#             u("1563861820509-61a107aa0c93"),
#             u("1524592099904-0c2855d2b62c"),
#         ],
#     },
#     {
#         "name": "Gaming Chair",
#         "description": (
#             "Ergonomic gaming chair with lumbar support pillow, height tilt, and 4D armrests. "
#             "High back and recline for long sessions; durable upholstery and smooth-rolling casters."
#         ),
#         "images": [
#             u("1598550476439-68477867c587"),
#             u("1616627451515-cbc80e5ece1a"),
#             u("1540575462033-afef0c493d5a"),
#         ],
#     },
#     {
#         "name": "Standing Desk",
#         "description": (
#             "Electric height-adjustable desk with memory presets and quiet dual motors. "
#             "Wide desktop for monitors and accessories; cable management tray included."
#         ),
#         "images": [
#             u("1593642632559-0c6d3fc62b89"),
#             u("1595515106969-1b44114aa5b5"),
#             u("1524758631624-e2822e101c0b"),
#         ],
#     },
#     {
#         "name": "Monitor Stand",
#         "description": (
#             "Monitor riser with storage shelf underneath for keyboard, hub, or notebooks. "
#             "Raises screens to eye level; solid wood or metal options for a cleaner desk setup."
#         ),
#         "images": [
#             u("1593759608142-e976b8ef71af"),
#             u("1527443223544-f0d27cb8f00d"),
#             u("1496181133206-80ce9b88a853"),
#         ],
#     },
#     {
#         "name": "Webcam",
#         "description": (
#             "1080p webcam with autofocus, stereo microphones, and privacy shutter. "
#             "Clip mount fits laptops and monitors; plug-and-play USB for streaming or video calls."
#         ),
#         "images": [
#             u("1611186871525-7a17d0f82a14"),
#             u("1587825140428-d25e039b55d6"),
#             u("1516321490587-3d01c2aacf43"),
#         ],
#     },
#     {
#         "name": "Ring Light",
#         "description": (
#             "LED ring light with adjustable brightness and color temperature for content creation. "
#             "Includes tripod stand and phone holder for TikTok, Zoom, or product photography."
#         ),
#         "images": [
#             u("1616627451515-cbc80e5ece1a"),
#             u("1598387993449-4b66710c39aa"),
#             u("1526170375885-4d8ecf77b99f"),
#         ],
#     },
#     {
#         "name": "Air Purifier",
#         "description": (
#             "HEPA air purifier for medium rooms: captures dust, pollen, and pet dander. "
#             "Quiet night mode, filter replacement indicator, and simple touch controls."
#         ),
#         "images": [
#             u("1585771724684-38269d6639fd"),
#             u("1581578731548-64663611918a"),
#             u("1558618666-fcd25c85cd64"),
#         ],
#     },
#     {
#         "name": "Electric Kettle",
#         "description": (
#             "Stainless steel electric kettle with rapid boil and auto shut-off. "
#             "Cordless pitcher with cool-touch handle; perfect for tea, pour-over coffee, or instant meals."
#         ),
#         "images": [
#             u("1544441893-675973e31985"),
#             u("1571932771077-d3c1a1f0c3b8"),
#             u("1556919117-f1e8568f6a4c"),
#         ],
#     },
#     {
#         "name": "Toaster Oven",
#         "description": (
#             "Compact toaster oven with bake, broil, and toast settings. Fits small pizzas and sheet pans; "
#             "timer and temperature dial for quick weeknight meals."
#         ),
#         "images": [
#             u("1556909114-f6e7ad7d3136"),
#             u("1585668775886-81bf63d1e146"),
#             u("1556911220-e15c29d3a23a"),
#         ],
#     },
#     {
#         "name": "Rice Cooker",
#         "description": (
#             "One-touch rice cooker with non-stick inner pot and keep-warm mode. "
#             "Cooks white, brown, or mixed grains; steamer tray option for vegetables and dumplings."
#         ),
#         "images": [
#             u("1556919117-f1e8568f6a4c"),
#             u("1608043152269-423dbba4e7e1"),
#             u("1547592166-da74b065c22c"),
#         ],
#     },
#     {
#         "name": "Hand Blender",
#         "description": (
#             "Immersion blender set with whisk and chopper attachments. "
#             "Variable speed for soups, sauces, and smoothies directly in the pot—easy cleanup, compact storage."
#         ),
#         "images": [
#             u("1547949003-9792a18a2601"),
#             u("1556911220-e15c29d3a23a"),
#             u("1511920170033-f8396924c348"),
#         ],
#     },
# ]


# def pick_images(urls: List[str]) -> List[str]:
#     n = len(urls)
#     if n == 0:
#         return []
#     if n == 1:
#         return urls.copy()
#     k = random.randint(2, min(5, n))
#     return random.sample(urls, k)


# def random_created_at() -> str:
#     days_ago = random.randint(0, 365)
#     dt = datetime.now(timezone.utc) - timedelta(
#         days=days_ago, seconds=random.randint(0, 86400)
#     )
#     return dt.strftime("%Y-%m-%d %H:%M:%S+00")


# def generate_insert() -> str:
#     item_id = str(uuid.uuid4())
#     template = random.choice(LISTING_TEMPLATES)
#     name = f"{template['name']} {random.randint(1, 999)}"
#     desc = template["description"]
#     price = round(random.uniform(1.99, 999.99), 2)
#     created_at = random_created_at()
#     seller = random.choice(SAMPLE_SELLERS)

#     item_data = {
#         "sellerId": seller["id"],
#         "sellerName": seller["name"],
#         "name": name,
#         "description": desc,
#         "price": price,
#         "created_at": created_at,
#         "images": pick_images(template["images"]),
#     }

#     json_data = json.dumps(item_data).replace("'", "''")

#     return f"INSERT INTO item (id, data) VALUES ('{item_id}', '{json_data}'::jsonb);"


# while True:
#     try:
#         count = int(input("How many listings do you want to generate? "))
#         if count <= 0:
#             print("Please enter a number greater than 0.")
#             continue
#         break
#     except ValueError:
#         print("Invalid input — please enter a whole number.")

# SQL_FILE = "data.sql"
# file_exists = os.path.exists(SQL_FILE)

# if file_exists:
#     with open(SQL_FILE, "r") as f:
#         first_line = f.readline().strip()

#     if first_line != "\\c items":
#         with open(SQL_FILE, "r") as f:
#             existing = f.read()
#         with open(SQL_FILE, "w") as f:
#             f.write("\\c items\n" + existing)
#         print("Prepended '\\c items' to existing data.sql")

#     with open(SQL_FILE, "a") as f:
#         for _ in range(count):
#             f.write(generate_insert() + "\n")
#     print(f"Appended {count} INSERT statements to {SQL_FILE}")

# else:
#     with open(SQL_FILE, "w") as f:
#         f.write("\\c items\n")
#         for _ in range(count):
#             f.write(generate_insert() + "\n")
#     print(f"Created {SQL_FILE} with {count} INSERT statements")


import json
import uuid
import random
import re
import urllib.request
from datetime import datetime, timedelta, timezone

SAMPLE_SELLERS = [
    {"id": str(uuid.uuid4()), "name": "Avery Parks"},
    {"id": str(uuid.uuid4()), "name": "Jordan Lee"},
    {"id": str(uuid.uuid4()), "name": "Morgan Blake"},
    {"id": str(uuid.uuid4()), "name": "Riley Quinn"},
    {"id": str(uuid.uuid4()), "name": "Taylor Brooks"},
]


CATEGORY_TAGS = {
    "beauty": ["beauty"],
    "fragrances": ["beauty"],
    "furniture": ["decor"],
    "groceries": ["food"],
    "home-decoration": ["decor"],
    "kitchen-accessories": ["home", "tools"],
    "laptops": ["electronics"],
    "mens-shirts": ["clothing"],
    "mens-shoes": ["clothing", "outdoors"],
    "mens-watches": ["clothing", "accessories"],
    "mobile-accessories": ["electronics", "travel"],
    "motorcycle": ["vehicles", "outdoors"],
    "skin-care": ["beauty", "health"],
    "smartphones": ["electronics"],
    "sports-accessories": ["outdoors", "fitness"],
    "sunglasses": ["clothing", "travel"],
    "tablets": ["electronics"],
    "tops": ["clothing"],
    "vehicle": ["vehicles", "tools"],
    "womens-bags": ["clothing", "travel"],
    "womens-dresses": ["clothing"],
    "womens-jewellery": ["clothing", "accessories"],
    "womens-shoes": ["clothing"],
    "womens-watches": ["clothing", "accessories"],
}


KEYWORD_TAGS = {
    "airpods": ["electronics", "travel"],
    "air purifier": ["health"],
    "baseball": ["outdoors", "fitness"],
    "basketball": ["outdoors", "fitness"],
    "backpack": ["travel"],
    "bag": ["travel"],
    "bat": ["outdoors", "fitness"],
    "beef": ["food"],
    "blender": ["home", "tools"],
    "camp": ["outdoors"],
    "cat": ["pets"],
    "charger": ["electronics", "travel"],
    "chicken": ["food"],
    "cook": ["home", "tools"],
    "dog": ["pets"],
    "earphone": ["electronics", "travel"],
    "earphones": ["electronics", "travel"],
    "food": ["food"],
    "football": ["outdoors", "fitness"],
    "fitness": ["health"],
    "garden": ["outdoors"],
    "grater": ["home", "tools"],
    "golf": ["outdoors"],
    "glasses": ["clothing", "accessories"],
    "health": ["health"],
    "kettle": ["home", "tools"],
    "lamp": ["decor"],
    "laptop": ["electronics"],
    "makeup": ["beauty"],
    "mascara": ["beauty"],
    "meat": ["food"],
    "monopod": ["electronics", "travel"],
    "motorcycle": ["vehicles", "outdoors"],
    "mug": ["home", "decor"],
    "nail polish": ["beauty"],
    "phone": ["electronics"],
    "phones": ["electronics"],
    "plant": ["decor"],
    "racket": ["outdoors", "fitness"],
    "rice": ["food"],
    "shoe": ["clothing"],
    "skin": ["beauty", "health"],
    "smartphone": ["electronics"],
    "sport": ["outdoors", "fitness"],
    "tennis": ["outdoors", "fitness"],
    "tool": ["tools"],
    "travel": ["travel"],
    "volleyball": ["outdoors", "fitness"],
    "watch": ["clothing", "accessories"],
    "wok": ["home", "tools"],
}


def has_keyword(text: str, keyword: str) -> bool:
    pattern = rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])"
    return re.search(pattern, text) is not None


def product_tags(product: dict) -> list:
    tags = CATEGORY_TAGS.get(product.get("category", ""), []).copy()
    text = f"{product.get('title', '')} {product.get('description', '')}".lower()
    for keyword, keyword_tags in KEYWORD_TAGS.items():
        if has_keyword(text, keyword):
            tags.extend(keyword_tags)
    return sorted(set(tags or ["misc"]))


def fetch_products(limit: int = 100) -> list:
    url = f"https://dummyjson.com/products?limit={limit}&select=title,description,price,images,category"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read())["products"]


def random_created_at() -> str:
    dt = datetime.now(timezone.utc) - timedelta(
        days=random.randint(0, 365), seconds=random.randint(0, 86400)
    )
    return dt.strftime("%Y-%m-%d %H:%M:%S+00")


def generate_inserts(products: list, count: int) -> list:
    inserts = []
    for _ in range(count):
        product = random.choice(products)
        seller = random.choice(SAMPLE_SELLERS)
        # vary price slightly so repeated products aren't identical
        price = round(product["price"] * random.uniform(0.85, 1.15), 2)
        item_data = {
            "sellerId": seller["id"],
            "sellerName": seller["name"],
            "name": product["title"],
            "description": product["description"],
            "price": price,
            "quantity": random.randint(1, 50),
            "created_at": random_created_at(),
            "images": product["images"][:5],
            "tags": product_tags(product),
        }
        json_data = json.dumps(item_data).replace("'", "''")
        item_id = str(uuid.uuid4())
        inserts.append(f"INSERT INTO item (id, data) VALUES ('{item_id}', '{json_data}'::jsonb);")
    return inserts


while True:
    try:
        count = int(input("How many listings do you want to generate? "))
        if count > 0:
            break
        print("Please enter a number greater than 0.")
    except ValueError:
        print("Invalid input — please enter a whole number.")

print("Fetching products from DummyJSON...")
products = fetch_products(limit=194)
print(f"Fetched {len(products)} products.")

inserts = generate_inserts(products, count)

SQL_FILE = "data.sql"
with open(SQL_FILE, "w") as f:
    f.write("\\c items\n")
    for insert in inserts:
        f.write(insert + "\n")

print(f"Written {count} INSERT statements to {SQL_FILE}")
