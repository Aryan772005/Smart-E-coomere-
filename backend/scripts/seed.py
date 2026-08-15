"""
Seed script to populate backend database with realistic second-hand pre-owned tech products across multiple categories.
"""
import sys
import os
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
import django
django.setup()

from apps.marketplace.models import Category, Product, ProductImage
from apps.accounts.models import User

# 1. Categories
CATEGORIES = [
    {"name": "Sell Phone", "icon": "Smartphone", "slug": "smartphones"},
    {"name": "Sell Laptop", "icon": "Laptop", "slug": "laptops"},
    {"name": "Sell Tablet", "icon": "Tablet", "slug": "tablets"},
    {"name": "Smartwatches", "icon": "Watch", "slug": "wearables"},
    {"name": "Headphones", "icon": "Headphones", "slug": "audio"},
    {"name": "Gaming", "icon": "Gamepad2", "slug": "gaming"},
    {"name": "Cameras", "icon": "Camera", "slug": "cameras"},
    {"name": "TV & Appliances", "icon": "Zap", "slug": "appliances"},
]

print("Populating categories...")
cats = {}
for i, cat_data in enumerate(CATEGORIES):
    cat, _ = Category.objects.get_or_create(
        slug=cat_data["slug"],
        defaults={**cat_data, "sort_order": i}
    )
    cats[cat.slug] = cat

# 2. Verified Accounts
admin_user, _ = User.objects.get_or_create(
    email="admin@tarianisellers.com",
    defaults={
        "first_name": "Tariani",
        "last_name": "Sellers Admin",
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
        "is_email_verified": True,
    }
)
admin_user.set_password("admin1234")
admin_user.save()

seller, _ = User.objects.get_or_create(
    email="seller@tarianisellers.com",
    defaults={
        "first_name": "Tariani Certified",
        "last_name": "Store",
        "role": "seller",
        "is_email_verified": True,
        "rating": 4.95,
        "review_count": 520,
        "completed_orders": 480,
        "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
    }
)
seller.set_password("demo1234")
seller.save()

# 3. Product Blueprints per Category
PHONE_MODELS = [
    ("Apple", "iPhone 15 Pro Max", 2023, 98000, 159900, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"),
    ("Apple", "iPhone 14 Pro", 2022, 69999, 129900, "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80"),
    ("Apple", "iPhone 13", 2021, 38999, 69900, "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80"),
    ("Apple", "iPhone 12 Mini", 2020, 24999, 59900, "https://images.unsplash.com/photo-1603921326210-6edd2d60ca68?w=800&auto=format&fit=crop&q=80"),
    ("Samsung", "Galaxy S24 Ultra 5G", 2024, 94999, 129999, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80"),
    ("Samsung", "Galaxy S23 FE 5G", 2023, 34999, 59999, "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"),
    ("Samsung", "Galaxy Z Flip 5", 2023, 52999, 99999, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"),
    ("Google", "Pixel 8 Pro 5G", 2023, 62999, 106999, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"),
    ("Google", "Pixel 7a 5G", 2023, 26999, 43999, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"),
    ("OnePlus", "OnePlus 12 5G", 2024, 52999, 64999, "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80"),
    ("OnePlus", "OnePlus 11R 5G", 2023, 27999, 39999, "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80"),
    ("Xiaomi", "Xiaomi 13 Pro 5G", 2023, 44999, 79999, "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80"),
    ("Nothing", "Nothing Phone (2)", 2023, 31999, 44999, "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80"),
]

LAPTOP_MODELS = [
    ("Apple", "MacBook Pro 16 M2 Max (32GB / 1TB)", 2023, 189999, 349900, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"),
    ("Apple", "MacBook Air M2 (8GB / 256GB Midnight)", 2022, 69999, 119900, "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"),
    ("Apple", "MacBook Air M1 (8GB / 256GB Space Grey)", 2020, 48999, 99900, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"),
    ("Dell", "Dell XPS 15 9530 (i7-13700H / RTX 4060)", 2023, 124999, 219900, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"),
    ("Dell", "Dell Inspiron 16 i5 13th Gen", 2023, 44999, 72990, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"),
    ("ASUS", "ROG Zephyrus G14 OLED (Ryzen 9 / RTX 4070)", 2024, 139999, 199990, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"),
    ("ASUS", "TUF Gaming F15 (i5 12th Gen / RTX 3050)", 2022, 49999, 78990, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80"),
    ("HP", "HP Spectre x360 OLED 2-in-1 (i7 13th Gen)", 2023, 98999, 169990, "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=800&auto=format&fit=crop&q=80"),
    ("Lenovo", "ThinkPad X1 Carbon Gen 11 (i7 13th Gen)", 2023, 112999, 198900, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"),
]

AUDIO_MODELS = [
    ("Sony", "Sony WH-1000XM5 Wireless Headphones", 2022, 19999, 34990, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"),
    ("Apple", "AirPods Pro 2nd Gen (USB-C)", 2023, 14999, 24900, "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80"),
    ("Bose", "Bose QuietComfort 45 ANC Headphones", 2021, 15999, 29900, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"),
    ("Sennheiser", "Sennheiser Momentum 4 Wireless", 2022, 18999, 34990, "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"),
]

GAMING_MODELS = [
    ("Sony", "PlayStation 5 Disc Edition (1TB)", 2022, 38999, 54990, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80"),
    ("Microsoft", "Xbox Series X Console 1TB", 2021, 36999, 55990, "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80"),
    ("Nintendo", "Nintendo Switch OLED Model", 2021, 21999, 34990, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80"),
]

WEARABLE_MODELS = [
    ("Apple", "Apple Watch Ultra 2 (49mm Titanium)", 2023, 59999, 89900, "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop&q=80"),
    ("Samsung", "Galaxy Watch 6 Classic 47mm LTE", 2023, 21999, 43999, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"),
]

TABLET_MODELS = [
    ("Apple", "iPad Pro 12.9 M2 Wi-Fi 128GB", 2022, 74999, 112900, "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80"),
    ("Samsung", "Galaxy Tab S9 Ultra 5G 256GB", 2023, 79999, 122999, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"),
]

CAMERA_MODELS = [
    ("Sony", "Sony Alpha A7 IV Mirrorless Body", 2022, 149999, 224990, "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80"),
    ("Canon", "Canon EOS R6 Mark II Mirrorless Kit", 2023, 169999, 243995, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"),
]

APPLIANCE_MODELS = [
    ("Sony", "Bravia 55-inch 4K Ultra HD Smart OLED TV", 2022, 78999, 149900, "https://images.unsplash.com/photo-1593784991095-87728731b086?w=800&auto=format&fit=crop&q=80"),
    ("Dyson", "Dyson V12 Detect Slim Cordless Vacuum", 2023, 38999, 55900, "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80"),
]

CONDITIONS = ["like-new", "excellent", "good", "fair", "new"]
CITIES = ["Mumbai", "Bangalore", "New Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh", "Lucknow", "Kochi", "Indore", "Surat"]
STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB"]
COLORS = ["Space Grey", "Silver", "Midnight", "Starlight", "Phantom Black", "Titanium", "Emerald Green", "Glacier White"]

print("Clearing existing catalog items...")
Product.all_objects.all().delete()

created_count = 0

def generate_products(category_slug, models_list, target_count=35):
    global created_count
    category = cats.get(category_slug)
    if not category:
        return

    print(f"Generating {target_count}+ second-hand listings for category '{category_slug}'...")

    for i in range(target_count):
        brand, model, base_year, base_price, base_orig, img_url = random.choice(models_list)
        cond = random.choice(CONDITIONS)
        city = random.choice(CITIES)
        storage = random.choice(STORAGES)
        color = random.choice(COLORS)
        
        # Variations in pricing and titles
        variation_factor = random.uniform(0.85, 1.15)
        price = int(base_price * variation_factor)
        orig_price = int(base_orig * variation_factor)
        
        title = f"Refurbished {brand} {model} ({storage} - {color})"
        desc = (
            f"Tariani Certified Pre-Owned {brand} {model}. Passed rigorous 32-point inspection. "
            f"100% genuine parts, battery health {random.randint(85, 99)}%. "
            f"Includes 6-Month Tariani Store Warranty, charging accessories, and tax invoice. "
            f"Inspected by technical experts in {city}."
        )

        product = Product.objects.create(
            title=title,
            description=desc,
            price=price,
            original_price=orig_price,
            condition=cond,
            listing_type="fixed",
            category=category,
            brand=brand,
            model=model,
            year=base_year,
            city=city,
            seller=seller,
            status="available",
            is_active=True,
            views=random.randint(120, 1850),
            wishlist_count=random.randint(12, 140),
        )

        ProductImage.objects.create(
            product=product,
            url=img_url,
            alt=title,
            is_primary=True,
            position=0,
        )

        created_count += 1

# Generate 35+ products per category (Total 280+ second-hand products)
generate_products("smartphones", PHONE_MODELS, 40)
generate_products("laptops", LAPTOP_MODELS, 40)
generate_products("audio", AUDIO_MODELS, 35)
generate_products("gaming", GAMING_MODELS, 35)
generate_products("wearables", WEARABLE_MODELS, 35)
generate_products("tablets", TABLET_MODELS, 35)
generate_products("cameras", CAMERA_MODELS, 30)
generate_products("appliances", APPLIANCE_MODELS, 30)

print(f"\nSuccessfully seeded {created_count} second-hand products across all categories!")
print("All items are verified and active on the Tariani Sellers website.")
