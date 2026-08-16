from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_title', 'price', 'quantity']
        read_only_fields = ['id']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'full_name', 'phone', 'address_line_1', 
            'city', 'state', 'pincode', 'payment_method', 
            'total_amount', 'discount_amount', 'created_at', 'items'
        ]
        read_only_fields = ['id', 'status', 'created_at']

class CreateOrderSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    address_line_1 = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)
    payment_method = serializers.CharField(max_length=20)
    
    # Simple list of dicts: [{'product_id': 1, 'quantity': 1}, ...]
    items = serializers.ListField(
        child=serializers.DictField()
    )
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")
        return value
