
import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Save, Percent, Edit2, AlertTriangle } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency, formatWeight, formatUnit } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string) => void;
  onEdit: (item: CartItem) => void;
  onClear: () => void;
  onCheckout: (discount: number) => void;
  onSaveOrder: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  onRemove, 
  onEdit,
  onClear,
  onCheckout, 
  onSaveOrder 
}) => {
  const [discount, setDiscount] = useState<string>('');
  
  // Reset discount when drawer opens/closes or cart empties
  useEffect(() => {
    if (!isOpen || cart.length === 0) setDiscount('');
  }, [isOpen, cart.length]);

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  
  // Calculate distinct items for display logic
  const totalItems = cart.length;
  const totalWeight = cart.reduce((acc, item) => acc + (item.weightGrams || 0), 0);
  
  const discountValue = parseFloat(discount.replace(',', '.')) || 0;
  const finalTotal = Math.max(0, subtotal - discountValue);

  return (
    <div 
      className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-mv-blue-700 text-white flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-mv-yellow-400" />
            <h2 className="text-lg font-bold">Pedido Atual</h2>
            <span className="bg-mv-blue-800 text-xs px-2 py-0.5 rounded-full font-mono border border-mv-blue-600">
              {cart.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
                <button 
                  onClick={() => {
                    if(window.confirm("Tem certeza que deseja limpar todo o carrinho?")) {
                      onClear();
                    }
                  }}
                  className="p-2 hover:bg-mv-blue-800 rounded text-red-200 hover:text-white transition-colors mr-2"
                  title="Limpar Carrinho"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-mv-blue-800 rounded transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="bg-slate-100 p-6 rounded-full">
                 <ShoppingBag className="w-12 h-12 opacity-20" />
              </div>
              <p className="font-medium">O carrinho está vazio</p>
              <button onClick={onClose} className="text-mv-blue-600 font-bold text-sm hover:underline">
                Voltar para vender
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex justify-between items-center border-l-4 border-l-mv-blue-500 group">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm">{item.productName}</h3>
                  <div className="flex gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                    <span className="bg-slate-100 px-1.5 rounded">
                      {item.unitType === 'UN' 
                        ? formatUnit(item.quantity || 1) 
                        : formatWeight(item.weightGrams || 0)
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="font-bold text-mv-blue-700 text-lg">{formatCurrency(item.price)}</span>
                  
                  <div className="flex gap-1 pl-3 border-l border-slate-100">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-slate-400 hover:text-mv-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remover Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 p-4 bg-white space-y-3 pb-8 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
          {totalWeight > 0 && (
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Peso Total (Fracionados):</span>
              <span className="font-mono font-medium">{formatWeight(totalWeight)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600 text-sm">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount Input */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-mv-blue-500 focus-within:border-transparent transition-all">
             <Percent className="w-4 h-4 text-slate-400" />
             <span className="text-sm font-bold text-slate-500">Desconto (R$):</span>
             <input 
               type="number"
               value={discount}
               onChange={(e) => setDiscount(e.target.value)}
               placeholder="0,00"
               className="flex-1 bg-transparent text-right font-bold text-red-600 outline-none placeholder:text-slate-300"
             />
          </div>

          <div className="flex justify-between items-end mb-2 pt-2 border-t border-dashed border-slate-200">
            <span className="text-base font-semibold text-slate-800">Total Final</span>
            <span className="text-3xl font-black text-mv-blue-700 tracking-tight">{formatCurrency(finalTotal)}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button 
                disabled={cart.length === 0}
                onClick={onSaveOrder}
                className="col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl shadow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1 text-xs"
            >
                <Save className="w-5 h-5" />
                <span>Salvar</span>
            </button>
            <button 
                disabled={cart.length === 0}
                onClick={() => onCheckout(discountValue)}
                className="col-span-2 bg-mv-blue-700 hover:bg-mv-blue-800 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <span>Receber / Pagar</span>
                <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
