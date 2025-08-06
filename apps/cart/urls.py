from django.urls import path
from .views import CartView, AddToCartView, UpdateCartItemView, RemoveCartItemView, ClearCartView

urlpatterns = [
    path('', CartView.as_view(), name='cart-detail'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('item/<int:item_id>/update/', UpdateCartItemView.as_view(), name='cart-item-update'),
    path('item/<int:item_id>/remove/', RemoveCartItemView.as_view(), name='cart-item-remove'),
    path('clear/', ClearCartView.as_view(), name='cart-clear'),
]
