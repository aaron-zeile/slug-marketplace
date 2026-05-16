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

REVIEW_BUCKETS = [
    {
        "rating_range": (1.0, 2.0),
        "comments": [
            "Terrible quality, fell apart after a day.",
            "Not as described at all, very disappointed.",
            "Broke immediately, complete waste of money.",
            "Would not recommend this to anyone.",
            "Returned it straight away, absolutely awful.",
            "Poor build quality and slow shipping on top of it.",
            "Nothing like the pictures, very misleading.",
        ],
    },
    {
        "rating_range": (2.1, 3.4),
        "comments": [
            "It's okay, but I expected better for the price.",
            "Mediocre quality, nothing special.",
            "Shipping was fine but the product is underwhelming.",
            "Works, but just barely. Wouldn't buy again.",
            "Feels cheap, but does the job I guess.",
            "Decent enough, but there are better options out there.",
            "Not bad, not great. Pretty average overall.",
        ],
    },
    {
        "rating_range": (3.5, 4.4),
        "comments": [
            "Solid product, does exactly what it says.",
            "Good quality for the price, happy with it.",
            "Works well, arrived on time. No complaints.",
            "Pretty happy with this purchase overall.",
            "Good value, would probably buy again.",
            "Nice item, minor issues but nothing major.",
            "Does the job well, good quality materials.",
        ],
    },
    {
        "rating_range": (4.5, 5.0),
        "comments": [
            "Absolutely love this, exceeded all my expectations!",
            "Perfect product, fast delivery, couldn't be happier.",
            "Outstanding quality, highly recommend to everyone.",
            "Best purchase I've made in a long time.",
            "Five stars, no hesitation. Incredible value.",
            "Phenomenal quality, will definitely be buying again.",
            "Blew me away — way better than I expected.",
        ],
    },
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

    bucket = random.choices(REVIEW_BUCKETS, weights=[5, 10, 35, 50])[0]
    rating = round(random.uniform(*bucket["rating_range"]), 1)
    content = random.choice(bucket["comments"])

    review_data = {
        "user": user_data,
        "content": content,
        "rating": rating,
        "created_at": random_created_at(),
    }

    json_body = json.dumps(review_data).replace("'", "''")
    return f"INSERT INTO review (id, item, data) VALUES ('{review_id}', '{item_id}', '{json_body}'::jsonb);"


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Generate review INSERTs for items in data.sql")
    parser.add_argument("--min", type=int, default=5, help="Minimum reviews per item")
    parser.add_argument("--max", type=int, default=15, help="Maximum reviews per item")
    parser.add_argument("--output", default=DATA_FILE, help="File to append INSERT statements to")
    args = parser.parse_args()

    item_ids = parse_item_ids(DATA_FILE)
    if not item_ids:
        raise SystemExit("No item IDs found in data.sql")

    total = 0
    with open(args.output, "a", encoding="utf-8") as f:
        if os.path.getsize(args.output) == 0:
            f.write("\\c items\n")

        for item_id in item_ids:
            count = random.randint(args.min, args.max)
            for _ in range(count):
                f.write(generate_review_insert(item_id) + "\n")
            total += count

    print(f"Appended {total} review INSERTs to {args.output} ({len(item_ids)} items, {args.min}–{args.max} reviews each)")


if __name__ == "__main__":
    main()