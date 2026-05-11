import { Component,EventEmitter, Input, Output } from '@angular/core';
import {Product} from '../../models/producto.model';

@Component({
  selector: 'app-product-card',
  standalone:true,
  imports:[],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
})
export class ProductCardComponent {
  @Input({required:true}) product!:Product;
  @Output() add = new EventEmitter<Product>();

  onAdd() {
    this.add.emit(this.product);
  }
}
