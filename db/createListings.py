# Creates N new listings / items

import random, os
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

def random_created_at():
    days_ago = random.randint(0, 365)
    dt = datetime.now(timezone.utc) - timedelta(days=days_ago, seconds=random.randint(0, 86400))
    return dt.strftime("%Y-%m-%d %H:%M:%S+00")

def generate_insert():
    name       = random.choice(SAMPLE_NAMES) + f" {random.randint(1, 999)}"
    desc       = random.choice(SAMPLE_DESCRIPTIONS)
    price      = round(random.uniform(1.99, 999.99), 2)
    created_at = random_created_at()

    name = name.replace("'", "''")
    desc = desc.replace("'", "''")

    return (
        f"INSERT INTO item (name, description, price, created_at) VALUES "
        f"('{name}', '{desc}', {price}, '{created_at}');"
    )

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
mode = "a" if os.path.exists(SQL_FILE) else "w"

with open(SQL_FILE, mode) as f:
    for _ in range(count):
        f.write(generate_insert() + "\n")

action = "Appended" if mode == "a" else "Created"
print(f"{action} {count} INSERT statements to {SQL_FILE}")