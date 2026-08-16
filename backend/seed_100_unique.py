import os
import django
import random
from decimal import Decimal

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.marketplace.models import Product, Category, ProductImage, ProductCondition, ListingType, ProductStatus
from apps.accounts.models import User

def generate_unique_products():
    if Product.all_objects.exists():
        print("Products already exist. Skipping seed.")
        return

    print("Setting up categories and seeding products...")

    # Ensure categories exist
    CATEGORIES_DATA = [
        ("Smartphones", "smartphones", "Smartphone"),
        ("Laptops", "laptops", "Laptop"),
        ("Audio", "audio", "Headphones"),
        ("Gaming", "gaming", "Gamepad2"),
        ("Wearables", "wearables", "Watch"),
        ("Tablets", "tablets", "Tablet"),
        ("Cameras", "cameras", "Camera"),
        ("Appliances", "appliances", "Zap"),
    ]
    cats = {}
    for name, slug, icon in CATEGORIES_DATA:
        cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name, "icon": icon})
        cats[slug] = cat

    # Get or create seller
    seller = User.objects.filter(role="seller").first()
    if not seller:
        seller = User.objects.create_user(
            email="seller@tarianisellers.com",
            password="password123",
            role="seller",
            first_name="Tariani Certified",
            last_name="Store",
            is_email_verified=True,
            rating=4.95,
        )

    # Real second hand products catalog with authentic URLs, realistic INR pricing & material descriptions
    phones = [
        ("Apple", "iPhone 15 Pro Max", 98000, 159900, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80", "Titanium Frame, Super Retina XDR Display, 94% Battery Health"),
        ("Apple", "iPhone 14 Pro", 69999, 129900, "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80", "Deep Purple Stainless Steel, Ceramic Shield, 91% Battery Health"),
        ("Apple", "iPhone 13", 38999, 69900, "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&auto=format&fit=crop&q=80", "Midnight Aluminum Body, OLED Retina, 89% Battery Health"),
        ("Samsung", "Galaxy S24 Ultra 5G", 94999, 129999, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80", "Titanium Gray Finish, Armor Aluminum, Built-in S-Pen, 100% Functional"),
        ("Samsung", "Galaxy S23 FE 5G", 34999, 59999, "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80", "Mint Green Glass Back, Dynamic AMOLED 2X, Minor corner mark"),
        ("Google", "Pixel 8 Pro 5G", 62999, 106999, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80", "Bay Blue Matte Glass, Tensor G3, Screen Protector Applied"),
        ("OnePlus", "OnePlus 12 5G", 52999, 64999, "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80", "Flowy Emerald Glass, Hasselblad Camera, 100W Warp Charger Included"),
    ]

    laptops = [
        ("Apple", "MacBook Pro 16 M2 Max", 189999, 349900, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80", "Space Black Aluminum, Liquid Retina XDR, 32GB RAM, 96% Battery Capacity"),
        ("Apple", "MacBook Air M2", 69999, 119900, "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80", "Midnight Anodized Finish, MagSafe 3, Original Box & Invoice"),
        ("Apple", "MacBook Air M1", 48999, 99900, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80", "Space Grey Metallic Chassis, Retina True Tone, Grade A Mint"),
        ("Dell", "Dell XPS 15 9530", 124999, 219900, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80", "CNC Machined Aluminum with Carbon Fiber Palmrest, 4K Touch OLED"),
        ("ASUS", "ROG Zephyrus G14 OLED", 139999, 199990, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80", "Eclipse Grey Magnesium Alloy, AniMe Matrix LED, RTX 4070"),
    ]

    audio = [
        ("Sony", "Sony WH-1000XM5 Wireless", 19999, 34990, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80", "Matte Silver Synthetic Leather Earcups, ANC 100% Functional, Carrying Case"),
        ("Apple", "AirPods Pro 2nd Gen USB-C", 14999, 24900, "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80", "Glossy White Charging Case, Lanyard Loop, Cleaned & Sanitized"),
        ("Bose", "Bose QuietComfort 45 ANC", 15999, 29900, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", "Triple Black Soft Plush Cushions, Quiet & Aware Modes, Audio Cable"),
    ]

    gaming = [
        ("Sony", "PlayStation 5 Disc Edition", 38999, 54990, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80", "White DualSense Controller, Stand, HDMI 2.1 Cable, Inspected Fan & Ports"),
        ("Microsoft", "Xbox Series X 1TB", 36999, 55990, "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80", "Matte Black Tower, Wireless Controller, 4K 120Hz Ultra HD Output"),
        ("Nintendo", "Nintendo Switch OLED Model", 21999, 34990, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80", "White Joy-Cons, Vibrant 7-inch OLED Screen, TV Dock & Cables"),
    ]

    wearables = [
        ("Apple", "Apple Watch Ultra 2 49mm", 59999, 89900, "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop&q=80", "Aerospace Titanium Case, Orange Ocean Band, Sapphire Crystal Front"),
        ("Samsung", "Galaxy Watch 6 Classic 47mm", 21999, 43999, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", "Black Stainless Steel, Rotating Bezel, Ridge Sport Strap"),
    ]

    cameras = [
        ("Sony", "Sony Alpha A7 IV Mirrorless Body", 149999, 224990, "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80", "Magnesium Alloy Weather-Sealed Body, Shutter Count: 4,200, Sensor Clean"),
        ("Canon", "Canon EOS R6 Mark II Body", 169999, 243995, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80", "Polycarbonate & Glass Fiber Exterior, Dual SD Slots, Battery + Charger"),
    ]

    catalogs = {
        "smartphones": phones,
        "laptops": laptops,
        "audio": audio,
        "gaming": gaming,
        "wearables": wearables,
        "cameras": cameras,
    }

    storage_options = ["128GB", "256GB", "512GB", "1TB"]
    color_options = ["Space Black", "Titanium", "Silver", "Midnight", "Starlight", "Phantom Black"]
    condition_options = [ProductCondition.LIKE_NEW, ProductCondition.EXCELLENT, ProductCondition.GOOD]
    cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chandigarh", "Kolkata", "Jaipur"]

    total_created = 0
    cat_keys = list(catalogs.keys())

    while total_created < 100:
        cat_slug = cat_keys[total_created % len(cat_keys)]
        items = catalogs[cat_slug]
        category = cats[cat_slug]

        item = random.choice(items)
        brand = item[0]
        model_name = item[1]
        base_price = item[2]
        base_orig = item[3]
        img_url = item[4]
        mat_desc = item[5]

        conf_storage = random.choice(storage_options)
        conf_color = random.choice(color_options)
        cond = random.choice(condition_options)
        city = random.choice(cities)

        price_variance = random.randint(-2000, 3000)
        price = max(5000, base_price + price_variance)
        orig_price = base_orig + price_variance

        title = f"Refurbished {brand} {model_name} ({conf_storage} - {conf_color})"
        full_desc = (
            f"Verified Second-Hand {title} in {cond.upper()} condition. "
            f"Material & Build: {mat_desc}. Passed 32-Point Technical Inspection. "
            f"Includes 6-Month Tariani Store Warranty, original charger & verified invoice from {city}."
        )

        product = Product.objects.create(
            seller=seller,
            category=category,
            title=title,
            description=full_desc,
            price=Decimal(str(price)),
            original_price=Decimal(str(orig_price)),
            condition=cond,
            listing_type=random.choice([ListingType.FIXED, ListingType.NEGOTIABLE]),
            status=ProductStatus.AVAILABLE,
            brand=brand,
            model=model_name,
            city=city,
            views=random.randint(150, 2400),
            wishlist_count=random.randint(15, 180)
        )

        ProductImage.objects.create(
            product=product,
            url=img_url,
            alt=title,
            is_primary=True,
            position=0
        )

        total_created += 1
        print(f"[{total_created}/100] Seeded {title} (INR {price:,})")

    print(f"Successfully generated {total_created} premium second-hand products!")

if __name__ == "__main__":
    generate_unique_products()
