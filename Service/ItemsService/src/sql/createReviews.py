import json
import os
import random
import re
import uuid
from datetime import datetime, timedelta, timezone

DATA_FILE = "data.sql"
ITEM_INSERT_RE = re.compile(r"INSERT INTO item \(id, data\) VALUES \('([0-9a-fA-F-]+)'", re.IGNORECASE)

SAMPLE_USERS = [
    {"name": "Avery Parks"},
    {"name": "Jordan Lee"},
    {"name": "Morgan Blake"},
    {"name": "Riley Quinn"},
    {"name": "Taylor Brooks"},
    {"name": "Jamie Fox"},
    {"name": "Casey Morgan"},
    {"name": "Dakota Lane"},
    {"name": "Quinn Ellis"},
    {"name": "Rowan Lee"},
]

SAMPLE_CONTENT = [
    "Great product and fast delivery.",
    "Exactly as described and excellent quality.",
    "I really liked this item; it works perfectly.",
    "The product is good, but shipping took a little long.",
    "Highly recommend this! It exceeded my expectations.",
    "Solid purchase for the price, would buy again.",
    "Very happy with the quality and the customer service.",
    "Appears durable and feels premium.",
    "Nice item overall, but I wish it came with more instructions.",
    "Quick setup and the functionality is great.",
]


def random_created_at():
    days_ago = random.randint(0, 365)
    dt = datetime.now(timezone.utc) - timedelta(days=days_ago, seconds=random.randint(0, 86400))
    return dt.strftime("%Y-%m-%d %H:%M:%S+00")


def parse_item_ids(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Cannot find {path}")

    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    return ITEM_INSERT_RE.findall(text)


def generate_review_insert(item_id):
    review_id = str(uuid.uuid4())
    user = random.choice(SAMPLE_USERS)
    user_data = {
        "id": str(uuid.uuid4()),
        "name": user["name"],
    }
    review_data = {
        "user": user_data,
        "content": random.choice(SAMPLE_CONTENT),
        "rating": round(random.uniform(1.0, 5.0), 1),
        "created_at": random_created_at(),
    }

    json_body = json.dumps(review_data).replace("'", "''")
    return f"INSERT INTO review (id, item, data) VALUES ('{review_id}', '{item_id}', '{json_body}'::jsonb);"


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Generate review INSERTs for items in data.sql")
    parser.add_argument("--count", type=int, default=10, help="Number of reviews to generate")
    parser.add_argument("--output", default=DATA_FILE, help="File to append INSERT statements to")
    parser.add_argument("--per-item", action="store_true", help="Generate one review per item")
    args = parser.parse_args()

    item_ids = parse_item_ids(DATA_FILE)
    if not item_ids:
        raise SystemExit("No item IDs found in data.sql")

    if args.per_item:
        count = len(item_ids)
    else:
        count = args.count

    with open(args.output, "a", encoding="utf-8") as f:
        if os.path.getsize(args.output) == 0:
            f.write("\\c items\n")

        for _ in range(count):
            item_id = random.choice(item_ids)
            f.write(generate_review_insert(item_id) + "\n")

    print(f"Appended {count} review INSERTs to {args.output}")


if __name__ == "__main__":
    main()
