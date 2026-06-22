import {Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf, SlicePipe} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {CartService} from '../../services/cart.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ShowCartComponent} from '../showCart/showcart.component';
import { LocalizationService } from '../../services/localization.service';
import { EnumLabelPipe } from '../../shared/enum-label.pipe';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-cart-archive',
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    SlicePipe,
    ShowCartComponent,
    TranslatePipe,
    EnumLabelPipe,
  ],
  templateUrl: './cart-archive.html',
  styleUrl: './cart-archive.scss'
})
export class CartArchive implements OnInit {


  list: any[] = [];
  cartListId: string | null = '';
  showCartId: string | null = '';
  showCartModalOpen: boolean = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private localization: LocalizationService
  ) {
  }

  ngOnInit(): void {
    this.cartListId = this.route.snapshot.paramMap.get('id');
    if (this.cartListId) {
      this.getArchivedCart();
    } else {
      console.error('ID списку не знайдено в URL');
    }
  }


  getArchivedCart() {
    this.cartService.getArchivedCart(this.cartListId!).subscribe({
      next: data => {
        this.list= data;
        console.log(this.list);
      },
      error: err => {
        console.log(err);
      }

    });
  }
  openShowCarForm(cartId: string): void {
    this.showCartId = cartId;
    this.showCartModalOpen = true;
  }

  closeShowCartModal(): void {
    this.showCartId = '';
    this.showCartModalOpen = false;

  }

  removeCartToArchive(cartId: string) {
    if(confirm(this.localization.translate('card.confirmRestore'))) {
      this.cartService.removeCartFromArchive(cartId).subscribe({
        next:() => {
          console.log(cartId);
          console.log('Successfully remove cart from archive');
          this.getArchivedCart();
        },
        error: err => {
          console.log(err);
        }
      });
    }
  }

}
