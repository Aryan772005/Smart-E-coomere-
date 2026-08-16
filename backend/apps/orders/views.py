from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db import transaction
from decimal import Decimal

from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from apps.marketplace.models import Product

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        # Users can only see their own orders
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        items_data = data.pop('items')
        
        with transaction.atomic():
            # Create Order
            order = Order.objects.create(
                user=request.user,
                full_name=data['full_name'],
                phone=data['phone'],
                address_line_1=data['address_line_1'],
                city=data['city'],
                state=data['state'],
                pincode=data['pincode'],
                payment_method=data['payment_method'],
                total_amount=0, # Will calculate below
            )
            
            total_amount = 0
            
            for item in items_data:
                product_id = item.get('product_id')
                quantity = item.get('quantity', 1)
                
                try:
                    product = Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    continue # Skip invalid products or return error
                
                # Add to total
                price = product.price
                total_amount += price * quantity
                
                # Create OrderItem
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_title=product.title,
                    price=price,
                    quantity=quantity
                )
                
                # Optionally, update product status
                # product.status = "reserved"
                # product.save()
            
            # Apply fake 10% discount if over 0 (for demo logic)
            discount = total_amount * Decimal('0.10') if total_amount > 0 else 0
            # For simplicity, keeping raw total for now to match UI unless promo applied
            # In a real app we'd pass a promo_code in the request
            
            order.total_amount = total_amount
            order.save()
            
        result_serializer = self.get_serializer(order)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
