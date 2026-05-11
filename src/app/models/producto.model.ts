export interface Product {
  id: number;
  name: string;
  price: number;
  imageURL: string;
  category: string;
  description: string;
  inStock: number;
  proveedor_id?: number;
  proveedor?: string;
}
