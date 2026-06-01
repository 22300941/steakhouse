export interface Product {
  id: number;
  name: string;
  price: number;
  imageURL: string;
  category: string;
  description: string;
  inStock: number;
  proveedor?: string;
  proveedor_id?: number;
  vigente?: number;
  fecha_modificacion?: string;
}