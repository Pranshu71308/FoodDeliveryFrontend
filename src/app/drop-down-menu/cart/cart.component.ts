import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CartCheckOutComponent } from '../cart-check-out/cart-check-out.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cart',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  originalCartItems: any[] = [];
  userId: number | null = null;
  changesMade: boolean = false;
  count : number|undefined;
  restauranId: number | null = null ;
  itemId: number | null = null ;
  quantity: number | null = null ;
  totalPrice: number | null = null ;
//userId, restaurantId, itemId, quantity, total Price
  constructor(private cartService: CartService,private snackBar: MatSnackBar,private modalService:NgbModal ) {
    this.userId = Number(localStorage.getItem('userid'));
   }

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
    if (this.userId) {
      this.cartService.getCartDetails(this.userId).subscribe({
        next: (items: any[]) => {
          this.cartItems = items;
          this.originalCartItems = JSON.parse(JSON.stringify(items)); // Deep copy of the cart items

        },
        error: (error: any) => {
          console.error('Error fetching cart items:', error);
          this.showSnackbar('Failed to fetch cart items');
        }
      });
    } else {
      console.error('User ID not found in local storage.');
    }
  }

  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  increaseQuantity(item: any): void {
    item.quantity += 1;
    this.checkForChanges();
  }

  decreaseQuantity(item: any): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.checkForChanges();
    } else {
      this.removeItem(item);
    }
  }
  checkForChanges(): void {
    this.changesMade = this.cartItems.some((item, index) => item.quantity !== this.originalCartItems[index].quantity);

  }
  // saveChanges(): void {
  //   if (this.userId) {
  //     this.cartService.updateCartItems(this.userId, this.cartItems).subscribe({
  //       next: () => {
  //         this.changesMade = false;
  //         this.originalCartItems = JSON.parse(JSON.stringify(this.cartItems)); // Update the original quantities
  //         this.showSnackbar('Changes saved successfully');
  //       },
  //       error: (error: any) => {
  //         console.error('Failed to save changes:', error);
  //         this.showSnackbar('Failed to save changes');
  //       }
  //     });
  //   } else {
  //     console.error('User ID not found in local storage.');
  //   }
  // }
  async saveChanges(cartItems:any): Promise<void> {
    if (this.userId) {
      // const totalPrice = this.calculateTotal();
      try {
        for (const item of this.cartItems) {

          await this.cartService.addItemToCart(this.userId, item.restaurantId, item.itemId, item.quantity, item.price).toPromise();
        }
        this.changesMade = false;
        this.originalCartItems = JSON.parse(JSON.stringify(this.cartItems)); // Update the original quantities
        this.showSnackbar('Changes saved successfully');
      } catch (error) {
        console.error('Failed to save changes:', error);
        this.showSnackbar('Failed to save changes');
      }
    } else {
      console.error('User ID not found in local storage.');
    }
  }
  showSnackbar(message: string, action: string = 'Close') {
    const config = new MatSnackBarConfig();
    config.duration = 2000;
    config.panelClass = ['custom-snackbar'];
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';

    this.snackBar.open(message, action, config);
  }
  removeItem(item: any): void {
    const index = this.cartItems.indexOf(item);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
      this.originalCartItems.splice(index, 1); // Also remove from the originalCartItems array
      // this.cartService.updateItem(item); // Update item in cart service

    }
  }

  loadCartItems(): void {
    if (this.userId) {
      this.cartService.getCartDetails(this.userId).subscribe({
        next: (items: any[]) => {
          this.cartItems = items;
        },
        error: (error: any) => {
          console.error('Error fetching cart items:', error);
          this.showSnackbar('Failed to fetch cart items');
        }
      });
    } else {
      console.error('User ID not found in local storage.');
    }
  }
  checkout(): void {
    const modalRef = this.modalService.open(CartCheckOutComponent,{size:'lg',centered:true});
    modalRef.componentInstance.cartItems=this.cartItems;

  }
  clearCart(): void {
    console.log("userID"+this.userId);
    if (this.userId) {
      this.cartService.clearCart(this.userId).subscribe({
        next: () => {
          this.cartItems = [];
          this.originalCartItems = [];
          console.log('Cart cleared successfully');
        },
        error: (error) => {
          console.error('Failed to clear cart:', error);
        }
      });
    } else {
      console.error('User ID not found in localStorage.');
    }
  }
}
