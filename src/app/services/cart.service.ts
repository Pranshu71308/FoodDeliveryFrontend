// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class CartService {
//   private cartItems: any[] = [];

//   addItem(item: any): void {
//     // console.log(item);

//     const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
//     if (existingItem) {
//       existingItem.quantity += item.quantity;
//     } else {
//       this.cartItems.push({ ...item });
//     }
//   }

//   getItems(): any[] {
//     console.log(this.cartItems);
//     return this.cartItems;
//   }

//   clearCart(): void {
//     this.cartItems = [];
//   }
// }
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  private storageKey = 'cartItems';

  constructor() {
    this.loadCartItems();
  }

  addItem(item: any): void {
    const existingItem = this.cartItems.find(cartItem => cartItem.itemId === item.itemId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cartItems.push({ ...item });
    }
    this.saveCartItems();
  }

  getItems(): any[] {
    return this.cartItems;
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCartItems();
  }

  private saveCartItems(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems));
  }

  private loadCartItems(): void {
    const savedItems = localStorage.getItem(this.storageKey);
    if (savedItems) {
      this.cartItems = JSON.parse(savedItems);
    }
  }
}
