import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http=inject(HttpClient);
  private apiUrl='http://localhost:3000/api/productos';
  getAll():Observable<Product[]>{
    return this.http.get<Product[]>(this.apiUrl)
  }
  }

 /* private parseProductsXml(xmlText: string): Product[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    // Si el XML está mal formado, normalmente aparece <parsererror>
    if (doc.getElementsByTagName('parsererror').length > 0) {
      return [];
    }

    const nodes = Array.from(doc.getElementsByTagName('product'));

    return nodes.map((node) => ({
      id: this.getNumber(node, 'id'),
      name: this.getText(node, 'name'),
      price: this.getNumber(node, 'price'),
      imageURL: this.getText(node, 'imageURL'),
      category: this.getText(node, 'category'),
      description: this.getText(node, 'description'),
      inStock: this.getNumber(node, 'inStock'),
    }));
  }

  private getText(parent: Element, tag: string): string {
    return parent.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
  }

  private getNumber(parent: Element, tag: string): number {
    const value = this.getText(parent, tag);
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private getBoolean(parent: Element, tag: string): boolean {
    const value = this.getText(parent, tag).toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  }
*/
