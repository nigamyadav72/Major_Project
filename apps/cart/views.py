from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.products.models import Product

@method_decorator(csrf_exempt, name='dispatch')
class CartView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            if request.user.is_authenticated:
                cart, created = Cart.objects.get_or_create(user=request.user)
            else:
                session_key = request.session.session_key
                if not session_key:
                    request.session.save()
                    session_key = request.session.session_key
                cart, created = Cart.objects.get_or_create(session_key=session_key)
            
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class AddToCartView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            # Get or create cart
            if request.user.is_authenticated:
                cart, created = Cart.objects.get_or_create(user=request.user)
            else:
                session_key = request.session.session_key
                if not session_key:
                    request.session.save()
                    session_key = request.session.session_key
                cart, created = Cart.objects.get_or_create(session_key=session_key)
            
            # Get product and quantity
            product_id = request.data.get('product')
            quantity = int(request.data.get('quantity', 1))
            
            if not product_id:
                return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            product = get_object_or_404(Product, id=product_id)
            
            # Add or update cart item
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, 
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            
            return Response({
                'success': True, 
                'message': 'Item added to cart',
                'item': CartItemSerializer(cart_item, context={'request': request}).data
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class UpdateCartItemView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def patch(self, request, item_id):
        try:
            if request.user.is_authenticated:
                cart = get_object_or_404(Cart, user=request.user)
            else:
                session_key = request.session.session_key
                cart = get_object_or_404(Cart, session_key=session_key)
            
            item = get_object_or_404(CartItem, id=item_id, cart=cart)
            quantity = int(request.data.get('quantity', 1))
            
            if quantity <= 0:
                item.delete()
                return Response({'success': True, 'message': 'Item removed from cart'})
            
            item.quantity = quantity
            item.save()
            
            return Response({
                'success': True, 
                'item': CartItemSerializer(item, context={'request': request}).data
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class RemoveCartItemView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def delete(self, request, item_id):
        try:
            if request.user.is_authenticated:
                cart = get_object_or_404(Cart, user=request.user)
            else:
                session_key = request.session.session_key
                cart = get_object_or_404(Cart, session_key=session_key)
            
            item = get_object_or_404(CartItem, id=item_id, cart=cart)
            item.delete()
            
            return Response({'success': True, 'message': 'Item removed from cart'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class ClearCartView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            if request.user.is_authenticated:
                cart = get_object_or_404(Cart, user=request.user)
            else:
                session_key = request.session.session_key
                cart = get_object_or_404(Cart, session_key=session_key)
            
            cart.items.all().delete()
            
            return Response({'success': True, 'message': 'Cart cleared'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
