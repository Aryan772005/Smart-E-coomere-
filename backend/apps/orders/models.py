from django.db import models
from apps.core.models.base import TimeStampedModel
from apps.marketplace.models import Product

class OrderStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    SHIPPED = "shipped", "Shipped"
    DELIVERED = "delivered", "Delivered"
    CANCELLED = "cancelled", "Cancelled"

class PaymentMethod(models.TextChoices):
    CARD = "card", "Credit / Debit Card"
    UPI = "upi", "UPI"
    COD = "cod", "Cash on Delivery"

class Order(TimeStampedModel):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    
    # Shipping Details
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address_line_1 = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    
    # Financials
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return f"Order #{self.id} by {self.user.email}"

class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name="order_items")
    
    # Snapshots at the time of purchase
    product_title = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.quantity}x {self.product_title} in Order #{self.order.id}"
