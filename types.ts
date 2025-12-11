
export enum CheeseCutType {
  SLICED = 'Fatiado',
  BLOCK = 'Pedaço',
}

export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'FIADO';

export type OrderStatus = 'COMPLETED' | 'SAVED' | 'DEBT_PAYMENT';

export type UnitType = 'KG' | 'UN';

export interface Product {
  id: string;
  name: string;
  price: number; // Selling Price (per KG or per Unit)
  costPrice?: number; // Cost Price
  image?: string;
  isDefault?: boolean;
  unitType: UnitType; // 'KG' or 'UN'
  stock?: number; // Current stock
  trackStock?: boolean; // If true, deduct stock on sale
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  weightGrams?: number; // Used if type is KG
  quantity?: number;    // Used if type is UN
  unitType: UnitType;
  price: number;
  timestamp: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number; // Final total after discount
  subtotal?: number; // Total before discount
  discount?: number; // Discount amount
  paymentMethod: PaymentMethod | 'MISTO'; 
  customerName?: string; 
  timestamp: number;
  dateStr: string;
  status: OrderStatus;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  cpf: string;
  notes: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const MOZZARELLA_PRICE_PER_KG = 69.90; // Fallback constant
