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
        "images": [],
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
    # Check if \c items is already at the top
    with open(SQL_FILE, "r") as f:
        first_line = f.readline().strip()
    
    if first_line != "\\c items":
        # Prepend \c items to existing file
        with open(SQL_FILE, "r") as f:
            existing = f.read()
        with open(SQL_FILE, "w") as f:
            f.write("\\c items\n" + existing)
        print("Prepended '\\c items' to existing data.sql")
    
    # Append new inserts
    with open(SQL_FILE, "a") as f:
        for _ in range(count):
            f.write(generate_insert() + "\n")
    print(f"Appended {count} INSERT statements to {SQL_FILE}")

else:
    # Create new file with \c items at the top
    with open(SQL_FILE, "w") as f:
        f.write("\\c items\n")
        for _ in range(count):
            f.write(generate_insert() + "\n")
    print(f"Created {SQL_FILE} with {count} INSERT statements")