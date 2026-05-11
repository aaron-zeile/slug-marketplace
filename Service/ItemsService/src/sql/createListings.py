import json
import random
import os
import uuid
from datetime import datetime, timedelta, timezone

SAMPLE_NAMES = [
    "Wireless Headphones", "Running Shoes", "Coffee Maker", "Yoga Mat", "Backpack",
    "Sunglasses", "Smartwatch", "Blender", "Desk Lamp", "Mechanical Keyboard",
    "Water Bottle", "Notebook", "Phone Stand", "USB Hub", "Portable Charger",
    "Canvas Print", "Throw Pillow", "Scented Candle", "Plant Pot", "Wall Clock",
    "Gaming Chair", "Standing Desk", "Monitor Stand", "Webcam", "Ring Light",
    "Air Purifier", "Electric Kettle", "Toaster Oven", "Rice Cooker", "Hand Blender",
]

SAMPLE_DESCRIPTIONS = [
    "High quality product with premium materials and excellent durability.",
    "Perfect for everyday use, designed with comfort and style in mind.",
    "A must-have item for anyone looking for reliability and performance.",
    "Sleek modern design that fits seamlessly into any lifestyle.",
    "Crafted with care to deliver outstanding value and satisfaction.",
    "Lightweight and portable, ideal for home or on the go.",
    "Top-rated by customers for its ease of use and long-lasting build.",
    "Versatile and functional, suitable for a wide range of activities.",
    "Engineered for precision and built to last through years of daily use.",
    "An exceptional blend of form and function at an unbeatable price.",
]

SAMPLE_SELLERS = [
    {"id": str(uuid.uuid4()), "name": "Avery Parks"},
    {"id": str(uuid.uuid4()), "name": "Jordan Lee"},
    {"id": str(uuid.uuid4()), "name": "Morgan Blake"},
    {"id": str(uuid.uuid4()), "name": "Riley Quinn"},
    {"id": str(uuid.uuid4()), "name": "Taylor Brooks"},
]

# Real working Unsplash image URLs (direct, no auth required)
IMAGE_POOL = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&fit=crop",  # headphones
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&fit=crop",  # headphones 2
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&fit=crop",  # running shoes
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&fit=crop",  # shoes 2
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&fit=crop",  # coffee maker
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&fit=crop",  # coffee cup
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&fit=crop",  # yoga mat
    "https://images.unsplash.com/photo-1546938576-6e3d5229e153?w=600&fit=crop",  # backpack
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&fit=crop",  # sunglasses
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&fit=crop",  # smartwatch
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&fit=crop",  # product flat lay
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&fit=crop",  # blender
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&fit=crop",  # desk lamp
    "https://images.unsplash.com/photo-1601933470096-0e34634ffcde?w=600&fit=crop",  # keyboard
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&fit=crop",  # water bottle
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&fit=crop",  # water bottle 2
    "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&fit=crop",  # candle
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&fit=crop",  # couch/furniture
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&fit=crop",  # desk setup
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&fit=crop",  # phone
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&fit=crop",  # camera/product
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&fit=crop",  # plant pot
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&fit=crop",  # wall clock
    "https://images.unsplash.com/photo-1616627451515-cbc80e5ece1a?w=600&fit=crop",  # ring light
    "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&fit=crop",  # electric kettle
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&fit=crop",  # toaster oven
    "https://images.unsplash.com/photo-1593759608142-e976b8ef71af?w=600&fit=crop",  # monitor setup
    "https://images.unsplash.com/photo-1611186871525-7a17d0f82a14?w=600&fit=crop",  # webcam setup
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&fit=crop",  # air purifier
    "https://images.unsplash.com/photo-1585399000684-d2f72d3c1a1b?w=600&fit=crop",  # smartwatch 3
]


def random_images():
    count = random.randint(2, 5)
    return random.sample(IMAGE_POOL, count)


def random_created_at():
    days_ago = random.randint(0, 365)
    dt = datetime.now(timezone.utc) - timedelta(days=days_ago, seconds=random.randint(0, 86400))
    return dt.strftime("%Y-%m-%d %H:%M:%S+00")


def generate_insert():
    item_id = str(uuid.uuid4())
    name = random.choice(SAMPLE_NAMES) + f" {random.randint(1, 999)}"
    desc = random.choice(SAMPLE_DESCRIPTIONS)
    price = round(random.uniform(1.99, 999.99), 2)
    created_at = random_created_at()
    seller = random.choice(SAMPLE_SELLERS)

    item_data = {
        "sellerId": seller["id"],
        "sellerName": seller["name"],
        "name": name,
        "description": desc,
        "price": price,
        "created_at": created_at,
        "images": random_images(),  # 2–5 real image URLs
    }

    json_data = json.dumps(item_data).replace("'", "''")

    return f"INSERT INTO item (id, data) VALUES ('{item_id}', '{json_data}'::jsonb);"


while True:
    try:
        count = int(input("How many listings do you want to generate? "))
        if count <= 0:
            print("Please enter a number greater than 0.")
            continue
        break
    except ValueError:
        print("Invalid input — please enter a whole number.")

SQL_FILE = "data.sql"
file_exists = os.path.exists(SQL_FILE)

if file_exists:
    with open(SQL_FILE, "r") as f:
        first_line = f.readline().strip()

    if first_line != "\\c items":
        with open(SQL_FILE, "r") as f:
            existing = f.read()
        with open(SQL_FILE, "w") as f:
            f.write("\\c items\n" + existing)
        print("Prepended '\\c items' to existing data.sql")

    with open(SQL_FILE, "a") as f:
        for _ in range(count):
            f.write(generate_insert() + "\n")
    print(f"Appended {count} INSERT statements to {SQL_FILE}")

else:
    with open(SQL_FILE, "w") as f:
        f.write("\\c items\n")
        for _ in range(count):
            f.write(generate_insert() + "\n")
    print(f"Created {SQL_FILE} with {count} INSERT statements")