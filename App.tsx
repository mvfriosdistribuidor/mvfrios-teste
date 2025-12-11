
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Scale, Check, Plus, ClipboardList, History, Users, Wallet, X, Store, ChefHat, BarChart3, Calendar, Camera, Trophy, TrendingUp, DollarSign, UserPlus, Phone, MapPin, Search, User, ArrowRight, Save, Receipt, ChevronDown, ChevronUp, AlertCircle, Package, Pencil, Trash2, Box, Minus, Download } from 'lucide-react';
import { CartItem, MOZZARELLA_PRICE_PER_KG, Order, PaymentMethod, Customer, OrderStatus, Product, UnitType } from './types';
import { formatCurrency, IMAGES, formatWeight } from './constants';
import { CartDrawer } from './components/CartDrawer';
import { SommelierChat } from './components/SommelierChat';

type Tab = 'vender' | 'pedidos' | 'clientes' | 'estatisticas' | 'historico' | 'produtos';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>('vender');
  
  // POS State
  const [weight, setWeight] = useState<number>(250); // Grams
  const [quantity, setQuantity] = useState<number>(1); // Units
  
  // Products State
  const [products, setProducts] = useState<Product[]>([
    { id: 'mussarela-fatiado', name: 'Mussarela Fatiado', price: 69.90, unitType: 'KG', trackStock: false, image: IMAGES.PRODUCT_SLICED, isDefault: true },
    { id: 'mussarela-pedaco', name: 'Mussarela Pedaço', price: 65.90, unitType: 'KG', trackStock: false, image: IMAGES.PRODUCT_BLOCK, isDefault: true },
  ]);
  const [selectedProductId, setSelectedProductId] = useState<string>('mussarela-fatiado');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSommelierOpen, setIsSommelierOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  // Product Management State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  // We keep this state for compatibility, but the modal will primarily be for editing now
  const [isEditingProductMode, setIsEditingProductMode] = useState(false);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [currentDiscount, setCurrentDiscount] = useState(0);

  // Debt Payment State
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');
  const [debtPaymentMethod, setDebtPaymentMethod] = useState<'DINHEIRO' | 'PIX'>('DINHEIRO');
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedOrders, setSavedOrders] = useState<Order[]>([]); // Drafts
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Customer Management State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: '',
    cpf: '',
    notes: ''
  });

  // UI Toggles
  const [showSavedOrders, setShowSavedOrders] = useState(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

  // Load data from LocalStorage on mount
  useEffect(() => {
    const savedOrdersData = localStorage.getItem('queijaria_orders');
    if (savedOrdersData) {
      try {
        setOrders(JSON.parse(savedOrdersData));
      } catch (e) {
        console.error("Failed to load orders", e);
      }
    }

    const savedDraftsData = localStorage.getItem('queijaria_drafts');
    if (savedDraftsData) {
      try {
        setSavedOrders(JSON.parse(savedDraftsData));
      } catch (e) {
        console.error("Failed to load drafts", e);
      }
    }

    const savedCart = localStorage.getItem('mv_current_cart');
    if (savedCart) {
        try {
            setCart(JSON.parse(savedCart));
        } catch (e) {
            console.error("Failed to load cart", e);
        }
    }

    const savedProducts = localStorage.getItem('mv_products');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        if (parsedProducts.length > 0) {
            setProducts(parsedProducts);
            // Ensure selected ID exists
            if (!parsedProducts.find((p: Product) => p.id === selectedProductId)) {
                setSelectedProductId(parsedProducts[0].id);
            }
        }
      } catch (e) {
        console.error("Failed to load products", e);
      }
    }

    const savedCustomers = localStorage.getItem('mv_customers');
    if (savedCustomers) {
      try {
        setCustomers(JSON.parse(savedCustomers));
      } catch (e) {
        console.error("Failed to load customers", e);
      }
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('queijaria_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('queijaria_drafts', JSON.stringify(savedOrders));
  }, [savedOrders]);

  useEffect(() => {
    localStorage.setItem('mv_current_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mv_customers', JSON.stringify(customers));
  }, [customers]);

  // Derived state for current selection
  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  
  // Calculate price based on type
  const currentPrice = selectedProduct?.unitType === 'UN'
    ? (selectedProduct.price || 0) * quantity
    : (weight / 1000) * (selectedProduct?.price || 0);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price, 0);

  // --- Handlers ---

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    // Check Stock if enabled
    if (selectedProduct.trackStock && selectedProduct.stock !== undefined) {
      const requiredAmount = selectedProduct.unitType === 'UN' ? quantity : weight;
      if (selectedProduct.stock < requiredAmount) {
        if (!window.confirm(`Atenção: Estoque insuficiente (${selectedProduct.stock} disponível). Deseja adicionar mesmo assim?`)) {
          return;
        }
      }
    }

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unitType: selectedProduct.unitType,
      weightGrams: selectedProduct.unitType === 'KG' ? weight : undefined,
      quantity: selectedProduct.unitType === 'UN' ? quantity : undefined,
      price: currentPrice,
      timestamp: Date.now(),
    };
    setCart([...cart, newItem]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleEditCartItem = (item: CartItem) => {
    // 1. Remove item from cart
    setCart(cart.filter(i => i.id !== item.id));
    // 2. Load values into inputs
    // Check if product still exists, otherwise default
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
        setSelectedProductId(item.productId);
        if (prod.unitType === 'UN' && item.quantity) {
          setQuantity(item.quantity);
        } else if (prod.unitType === 'KG' && item.weightGrams) {
          setWeight(item.weightGrams);
        }
    }
    // 3. Close drawer to show inputs
    setIsCartOpen(false);
  };

  const adjustWeight = (delta: number) => {
    setWeight(prev => {
      const newWeight = prev + delta;
      return Math.min(Math.max(newWeight, 0), 1000000); // Up to 1000kg (1,000,000g)
    });
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      return Math.min(Math.max(newQty, 1), 1000); // 1 to 1000 units
    });
  };

  // Product Management Handlers
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>, prodId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // If we are in the editing modal
        if (isProductModalOpen && editingProduct) {
            setEditingProduct(prev => ({ ...prev, image: result }));
            return;
        }

        // Quick upload from the card (if prodId provided)
        if (prodId) {
            setProducts(products.map(p => 
                p.id === prodId ? { ...p, image: result } : p
            ));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = () => {
      if (!editingProduct.name || !editingProduct.price) {
          alert("Nome e preço de venda são obrigatórios");
          return;
      }

      const cleanProduct: Product = {
          id: editingProduct.id || Date.now().toString(),
          name: editingProduct.name,
          price: Number(editingProduct.price),
          costPrice: editingProduct.costPrice ? Number(editingProduct.costPrice) : undefined,
          stock: editingProduct.stock ? Number(editingProduct.stock) : 0,
          trackStock: editingProduct.trackStock || false,
          unitType: editingProduct.unitType || 'KG',
          image: editingProduct.image || IMAGES.HERO_CHEESE,
          isDefault: false
      };

      if (editingProduct.id) {
          // Edit existing
          setProducts(products.map(p => p.id === editingProduct.id ? cleanProduct : p));
      } else {
          // Add new
          setProducts([...products, cleanProduct]);
      }
      setIsEditingProductMode(false);
      setEditingProduct({});
      setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir este produto?")) {
          const newProducts = products.filter(p => p.id !== id);
          setProducts(newProducts);
          if (selectedProductId === id && newProducts.length > 0) {
              setSelectedProductId(newProducts[0].id);
          }
      }
  };

  const openCheckout = (discount: number) => {
    setCurrentDiscount(discount);
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
    setSelectedPayment(null);
    setCustomerName('');
  };

  // Feature: Save Draft (Orçamento)
  const handleSaveOrder = () => {
    const newDraft: Order = {
      id: `draft-${Date.now()}`,
      items: [...cart],
      subtotal: cartSubtotal,
      total: cartSubtotal, 
      discount: 0,
      paymentMethod: 'DINHEIRO', 
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('pt-BR'),
      status: 'SAVED',
      customerName: 'Orçamento'
    };

    setSavedOrders([newDraft, ...savedOrders]);
    setCart([]);
    setIsCartOpen(false);
    alert('Orçamento salvo com sucesso! Acesse a aba "Pedidos".');
  };

  const loadDraft = (draft: Order) => {
    if (cart.length > 0) {
      if (!window.confirm('Isso irá substituir os itens atuais do carrinho. Deseja continuar?')) {
        return;
      }
    }
    setCart(draft.items);
    setSavedOrders(savedOrders.filter(o => o.id !== draft.id));
    setActiveTab('vender');
    setIsCartOpen(true);
  };

  const deleteDraft = (id: string) => {
    setSavedOrders(savedOrders.filter(o => o.id !== id));
  };

  const finalizeOrder = () => {
    if (!selectedPayment) return;
    if (selectedPayment === 'FIADO' && !customerName.trim()) {
      alert("Por favor, digite o nome do cliente para vender fiado.");
      return;
    }

    const finalTotal = Math.max(0, cartSubtotal - currentDiscount);

    // Update Stock
    const updatedProducts = products.map(p => {
       if (p.trackStock && p.stock !== undefined) {
           // Find items in cart that match this product
           const cartItems = cart.filter(item => item.productId === p.id);
           let amountSold = 0;
           
           cartItems.forEach(item => {
               if (item.unitType === 'UN') {
                   amountSold += (item.quantity || 0);
               } else {
                   amountSold += (item.weightGrams || 0);
               }
           });

           if (amountSold > 0) {
               return { ...p, stock: p.stock - amountSold };
           }
       }
       return p;
    });

    setProducts(updatedProducts);

    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal: cartSubtotal,
      discount: currentDiscount,
      total: finalTotal,
      paymentMethod: selectedPayment,
      customerName: customerName.trim() || 'Balcão',
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
      status: 'COMPLETED'
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsPaymentModalOpen(false);
    
    if (selectedPayment === 'FIADO') {
      alert("Venda Fiado registrada com sucesso!");
    } else {
      alert("Venda realizada com sucesso!");
    }
  };

  // Feature: Debt Payment
  const openDebtModal = (customer: Customer, currentDebt: number) => {
    setSelectedDebtor(customer);
    setDebtPaymentAmount(currentDebt.toString()); // Default to full debt
    setIsDebtModalOpen(true);
  };

  const handleDebtPayment = () => {
    if (!selectedDebtor) return;
    const amount = parseFloat(debtPaymentAmount.replace(',', '.'));
    if (!amount || amount <= 0) {
      alert("Valor inválido");
      return;
    }

    const paymentOrder: Order = {
      id: `pay-${Date.now()}`,
      items: [], // No items
      subtotal: 0,
      discount: 0,
      total: amount,
      paymentMethod: debtPaymentMethod,
      customerName: selectedDebtor.name,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
      status: 'DEBT_PAYMENT',
      notes: 'Abatimento de dívida'
    };

    setOrders([paymentOrder, ...orders]);
    setIsDebtModalOpen(false);
    alert(`Recebimento de ${formatCurrency(amount)} registrado!`);
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name?.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name.trim(),
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      cpf: newCustomer.cpf || '',
      notes: newCustomer.notes || '',
      createdAt: Date.now(),
    };

    setCustomers(prev => [...prev, customer]);
    setNewCustomer({ name: '', phone: '', address: '', cpf: '', notes: '' });
    setIsAddCustomerOpen(false);
  };

  const getDebtMap = () => {
    const debtMap: {[key: string]: number} = {};
    
    orders.forEach(order => {
      if (!order.customerName) return;
      const name = order.customerName;

      // Add to debt if FIADO
      if (order.status === 'COMPLETED' && order.paymentMethod === 'FIADO') {
        debtMap[name] = (debtMap[name] || 0) + order.total;
      }
      // Subtract from debt if DEBT_PAYMENT
      if (order.status === 'DEBT_PAYMENT') {
        debtMap[name] = (debtMap[name] || 0) - order.total;
      }
    });
    return debtMap;
  };

  // --- Views ---

  // 1. Vender (POS)
  const renderPOS = () => (
    <div className="pb-32">
      <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           <Scale className="w-6 h-6 text-mv-blue-700"/>
           Nova Venda
        </h2>

        {/* Dynamic Product Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {products.map((product) => {
            const isSelected = selectedProductId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => { setSelectedProductId(product.id); setQuantity(1); }}
                className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 shadow-sm ${
                  isSelected 
                    ? 'border-mv-blue-600 ring-2 ring-mv-blue-200 ring-offset-2' 
                    : 'border-slate-100 hover:border-mv-blue-300'
                }`}
              >
                {/* Image Area */}
                <div className="h-32 w-full bg-slate-100 relative">
                  <img 
                    src={product.image || IMAGES.HERO_CHEESE} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 transition-opacity ${isSelected ? 'bg-mv-blue-900/20' : 'bg-black/0 group-hover:bg-black/10'}`} />
                  <label 
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleProductImageUpload(e, product.id)}
                    />
                  </label>
                  {product.trackStock && (
                     <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                        Estoque: {product.unitType === 'KG' ? formatWeight(product.stock || 0) : `${product.stock} un`}
                     </div>
                  )}
                </div>

                {/* Content Area */}
                <div className={`p-3 ${isSelected ? 'bg-mv-blue-50' : 'bg-white'}`}>
                   <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold text-sm ${isSelected ? 'text-mv-blue-800' : 'text-slate-700'}`}>
                        {product.name}
                      </h3>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-mv-blue-600 mt-1.5 animate-pulse" />}
                   </div>
                   <p className="text-xs text-slate-500 font-medium">
                     {formatCurrency(product.price)} / {product.unitType === 'UN' ? 'un' : 'kg'}
                   </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CONTROLS: Weight OR Quantity */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
          {selectedProduct.unitType === 'KG' ? (
             <>
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Peso (Gramas)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            value={weight} 
                            onChange={(e) => setWeight(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-right w-24 font-bold text-slate-800"
                        />
                        <span className="text-sm font-extrabold text-slate-800">g</span>
                    </div>
                </div>
                
                <input
                    type="range"
                    min="0"
                    max="2000"
                    step="10"
                    value={Math.min(weight, 2000)} 
                    onChange={(e) => setWeight(parseInt(e.target.value))}
                    className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-mv-blue-600 mb-6"
                />

                <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => adjustWeight(-50)} className="h-12 bg-white rounded-lg border border-slate-200 text-slate-600 active:bg-slate-100 flex items-center justify-center font-bold text-lg">-50</button>
                    <button onClick={() => adjustWeight(50)} className="h-12 bg-white rounded-lg border border-slate-200 text-slate-600 active:bg-slate-100 flex items-center justify-center font-bold text-lg">+50</button>
                    <button onClick={() => adjustWeight(250)} className="h-12 bg-white rounded-lg border border-slate-200 text-slate-600 active:bg-slate-100 flex items-center justify-center font-bold text-sm">+250g</button>
                    <button onClick={() => adjustWeight(1000)} className="h-12 bg-white rounded-lg border border-slate-200 text-slate-600 active:bg-slate-100 flex items-center justify-center font-bold text-sm">+1kg</button>
                </div>
             </>
          ) : (
             <>
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quantidade (Unidades)</label>
                    <span className="text-3xl font-extrabold text-slate-800">{quantity}</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                     <button onClick={() => adjustQuantity(-1)} className="w-16 h-16 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center shadow-sm hover:border-mv-blue-400 active:scale-95 transition-all">
                        <Minus className="w-8 h-8 text-slate-600" />
                     </button>
                     <div className="flex-1 text-center">
                        <input 
                             type="number"
                             value={quantity}
                             onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                             className="w-full text-center text-4xl font-bold bg-transparent outline-none text-mv-blue-700"
                        />
                     </div>
                     <button onClick={() => adjustQuantity(1)} className="w-16 h-16 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center shadow-sm hover:border-mv-blue-400 active:scale-95 transition-all">
                        <Plus className="w-8 h-8 text-slate-600" />
                     </button>
                </div>
             </>
          )}
        </div>

        {/* Price Display */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-slate-400 font-medium">
             Total Item
          </div>
          <div className="text-4xl font-black text-mv-blue-700 tracking-tight">
             {formatCurrency(currentPrice)}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${
            justAdded ? 'bg-green-600 text-white' : 'bg-mv-blue-700 text-white hover:bg-mv-blue-800'
          }`}
        >
          {justAdded ? <Check className="w-6 h-6"/> : <Plus className="w-6 h-6"/>}
          {justAdded ? 'Adicionado' : 'Adicionar ao Pedido'}
        </button>
      </div>

      {/* Mini Cart Preview */}
      {cart.length > 0 && (
        <div className="px-4 mt-6 animate-in slide-in-from-bottom fade-in">
           <div 
             onClick={() => setIsCartOpen(true)}
             className="bg-slate-800 text-white p-4 rounded-xl shadow-xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform"
           >
              <div className="flex items-center gap-3">
                <div className="bg-slate-700 p-2 rounded-full relative">
                  <ShoppingCart className="w-5 h-5 text-mv-yellow-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-slate-800 font-bold">
                    {cart.length}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase font-bold">Total do Pedido</span>
                  <span className="font-bold text-lg">{formatCurrency(cartSubtotal)}</span>
                </div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium hover:bg-white/20">
                Ver / Pagar
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const todayOrders = orders.filter(o => o.dateStr.startsWith(today) && o.status !== 'DEBT_PAYMENT');

    return (
      <div className="p-4 pb-32">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           <ClipboardList className="w-6 h-6 text-mv-blue-700"/>
           Pedidos
        </h2>

        {/* Saved Drafts Toggle */}
        <div className="mb-6">
            <button 
                onClick={() => setShowSavedOrders(!showSavedOrders)}
                className="w-full bg-slate-100 hover:bg-slate-200 p-3 rounded-xl flex justify-between items-center transition-colors border border-slate-200"
            >
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Save className="w-5 h-5 text-mv-blue-600" />
                    <span>Orçamentos Salvos ({savedOrders.length})</span>
                </div>
                {showSavedOrders ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>

            {showSavedOrders && (
                <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                    {savedOrders.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-4">Nenhum orçamento salvo.</p>
                    ) : (
                        savedOrders.map(draft => (
                            <div key={draft.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-yellow-800 font-bold mb-1">{draft.dateStr}</p>
                                    <p className="font-bold text-slate-800">{formatCurrency(draft.total)}</p>
                                    <p className="text-xs text-slate-500">{draft.items.length} itens</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => deleteDraft(draft.id)}
                                        className="p-2 text-red-400 hover:bg-red-100 rounded-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => loadDraft(draft)}
                                        className="px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg text-sm font-bold shadow-sm"
                                    >
                                        Abrir
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
        
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Vendas de Hoje</h3>
        {todayOrders.length === 0 ? (
          <div className="text-center text-slate-400 py-10">Nenhuma venda realizada hoje.</div>
        ) : (
          <div className="space-y-3">
            {todayOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-mv-blue-500">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                       order.paymentMethod === 'FIADO' ? 'bg-red-100 text-red-700' :
                       order.paymentMethod === 'PIX' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                     }`}>
                       {order.paymentMethod}
                     </span>
                     <p className="text-slate-500 text-xs mt-1">{order.dateStr.split(' ')[1]}</p>
                   </div>
                   <div className="text-right">
                       <span className="text-lg font-bold text-slate-800">{formatCurrency(order.total)}</span>
                       {order.discount && order.discount > 0 && (
                           <span className="block text-[10px] text-red-500">Desconto: {formatCurrency(order.discount)}</span>
                       )}
                   </div>
                 </div>
                 <div className="text-sm text-slate-600">
                   {order.customerName && order.paymentMethod === 'FIADO' && (
                      <div className="flex items-center gap-1 mb-1 font-medium">
                         <Users className="w-3 h-3"/> {order.customerName}
                      </div>
                   )}
                   <div className="text-slate-400 text-xs">
                     {order.items.length} itens
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCustomers = () => {
    const debtMap = getDebtMap();
    const totalDebt = Object.values(debtMap).reduce((acc, val) => acc + (val > 0 ? val : 0), 0);
    const registeredNames = new Set(customers.map(c => c.name));
    let displayList = customers.map(c => ({
      ...c, isRegistered: true, debt: debtMap[c.name] || 0
    }));
    Object.entries(debtMap).forEach(([name, debt]) => {
      if (!registeredNames.has(name) && name !== 'Balcão') {
        const existing = displayList.find(c => c.name === name);
        if (!existing) {
             displayList.push({
                id: `temp-${name}`, name: name, phone: '', address: '', cpf: '', notes: 'Cliente não cadastrado',
                createdAt: 0, isRegistered: false, debt: debt
            });
        }
      }
    });
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      displayList = displayList.filter(c => c.name.toLowerCase().includes(lower));
    }
    displayList.sort((a, b) => {
      if (b.debt !== a.debt) return b.debt - a.debt;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="p-4 pb-32">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Users className="w-6 h-6 text-mv-blue-700"/>
             Gerenciar Clientes
        </h2>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 flex justify-between items-center shadow-sm">
           <span className="text-red-700 font-medium">Total em Fiado</span>
           <span className="text-2xl font-bold text-red-800">{formatCurrency(totalDebt)}</span>
        </div>
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mv-blue-500 text-sm"
            />
          </div>
          <button onClick={() => setIsAddCustomerOpen(true)} className="bg-mv-blue-700 text-white p-3 rounded-xl shadow-md hover:bg-mv-blue-800 active:scale-95 transition-all">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {displayList.length === 0 ? (
             <div className="text-center text-slate-400 py-10 flex flex-col items-center"><Users className="w-12 h-12 opacity-20 mb-2"/><p>Nenhum cliente encontrado.</p></div>
          ) : (
            displayList.map((client) => (
              <div key={client.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                 {client.debt > 0.01 && (<div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500" />)}
                 <div className="pl-3">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                       <h3 className="font-bold text-slate-800 text-lg">{client.name}</h3>
                       {!client.isRegistered && (<span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Não salvo</span>)}
                     </div>
                     {client.debt > 0.01 ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className="text-right">
                                <span className="block text-[10px] text-red-500 font-bold uppercase">Deve</span>
                                <span className="text-red-600 font-bold">{formatCurrency(client.debt)}</span>
                            </div>
                            <button onClick={() => openDebtModal(client, client.debt)} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors">Abater</button>
                        </div>
                     ) : (<span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Nada consta</span>)}
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const sales = orders.filter(o => o.status === 'COMPLETED');
    
    // Revenue calculations
    const todayOrders = sales.filter(o => o.timestamp >= startOfToday);
    const monthOrders = sales.filter(o => o.timestamp >= startOfMonth);
    const yearOrders = sales.filter(o => o.timestamp >= startOfYear);

    const revToday = todayOrders.reduce((acc, o) => acc + o.total, 0);
    const revMonth = monthOrders.reduce((acc, o) => acc + o.total, 0);
    const revYear = yearOrders.reduce((acc, o) => acc + o.total, 0);
    const revAllTime = sales.reduce((acc, o) => acc + o.total, 0);

    // Ranking Logic
    const customerSpending: {[key: string]: number} = {};
    sales.forEach(order => {
        if (order.customerName && order.customerName !== 'Balcão') {
            customerSpending[order.customerName] = (customerSpending[order.customerName] || 0) + order.total;
        }
    });

    const ranking = Object.entries(customerSpending)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);

    const avgTicket = sales.length > 0 ? revAllTime / sales.length : 0;
    const avgTicketToday = todayOrders.length > 0 ? revToday / todayOrders.length : 0;

    return (
      <div className="p-4 pb-32">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <BarChart3 className="w-6 h-6 text-mv-blue-700"/>
             Estatísticas
        </h2>

        {/* Hero Stats (Today) */}
        <div className="bg-gradient-to-r from-mv-blue-700 to-mv-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-mv-blue-100 text-sm font-medium mb-1">Faturamento Hoje</p>
                    <h3 className="text-4xl font-bold">{formatCurrency(revToday)}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                 <div>
                    <p className="text-mv-blue-100 text-xs">Ticket Médio (Hoje)</p>
                    <p className="font-bold text-lg">{formatCurrency(avgTicketToday)}</p>
                 </div>
                 <div>
                    <p className="text-mv-blue-100 text-xs">Vendas (Hoje)</p>
                    <p className="font-bold text-lg">{todayOrders.length}</p>
                 </div>
            </div>
        </div>

        {/* Period Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Este Mês</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(revMonth)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Este Ano</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(revYear)}</p>
            </div>
        </div>

        {/* General Ranking */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-mv-yellow-500" />
                    Ranking Geral de Clientes
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{ranking.length} clientes</span>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
                {ranking.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhum dado de cliente ainda.</div>
                ) : (
                    ranking.map((client, index) => (
                        <div key={client.name} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                      index === 1 ? 'bg-slate-200 text-slate-600' : 
                                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}
                                `}>
                                    {index + 1}
                                </div>
                                <span className="font-medium text-slate-700">{client.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">{formatCurrency(client.total)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Overview */}
        <div className="mb-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-mv-blue-600" />
                Visão Geral
            </h3>
            <div className="space-y-3">
                 <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-200">
                     <span className="text-slate-600">Faturamento Total (Desde o início)</span>
                     <span className="font-bold text-slate-800">{formatCurrency(revAllTime)}</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-200">
                     <span className="text-slate-600">Ticket Médio Geral</span>
                     <span className="font-bold text-slate-800">{formatCurrency(avgTicket)}</span>
                 </div>
            </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="p-4 pb-32">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><History className="w-6 h-6 text-mv-blue-700"/>Histórico Geral</h2>
      <div className="space-y-4">
        {orders.map((order) => (
            <div key={order.id} className="flex gap-4 items-start relative pb-6 border-l border-slate-200 pl-6 last:border-0 last:pb-0">
               <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${order.status === 'DEBT_PAYMENT' ? 'bg-purple-500' : order.paymentMethod === 'FIADO' ? 'bg-red-500' : 'bg-green-500'}`} />
               <div className="flex-1 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400 font-mono">{order.dateStr}</span>
                    <span className="font-bold text-slate-800">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {order.status === 'DEBT_PAYMENT' ? 'Recebimento' : `Venda (${order.paymentMethod})`}
                    {order.customerName && order.customerName !== 'Balcão' && (<span className="block text-xs text-slate-500 mt-1">{order.customerName}</span>)}
                  </div>
               </div>
            </div>
        ))}
      </div>
    </div>
  );

  // 6. Produtos (Management View)
  const renderProducts = () => (
    <div className="p-4 pb-32">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Package className="w-6 h-6 text-mv-blue-700"/>
             Gerenciar Produtos
        </h2>

        <button 
            onClick={() => { setIsEditingProductMode(true); setEditingProduct({ unitType: 'KG', trackStock: false }); setIsProductModalOpen(true); }}
            className="w-full py-3 bg-mv-blue-700 hover:bg-mv-blue-800 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mb-6"
        >
            <Plus className="w-5 h-5" /> Adicionar Novo Produto
        </button>

        <div className="space-y-3">
             {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <img src={product.image || IMAGES.HERO_CHEESE} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">{product.name}</h4>
                            <p className="text-xs text-slate-500">
                              {formatCurrency(product.price)} / {product.unitType === 'UN' ? 'un' : 'kg'}
                            </p>
                            {product.trackStock && (
                              <p className={`text-xs font-bold ${product.stock && product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                Estoque: {product.stock}
                              </p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setEditingProduct(product); setIsEditingProductMode(true); setIsProductModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-mv-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none">
      
      {/* Header */}
      <header className="bg-mv-blue-700 text-white p-4 pt-8 sticky top-0 z-20 shadow-lg">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2">
              <Store className="w-8 h-8 text-mv-yellow-400" />
              <div>
                <h1 className="text-xl font-black tracking-tight leading-tight text-white">MV FRIOS</h1>
                <p className="text-[10px] text-mv-blue-200 font-medium uppercase tracking-widest">Laticínios & Sabores</p>
              </div>
           </div>
           
           <div className="flex gap-2">
               {/* Install Button (PWA) */}
               {deferredPrompt && (
                   <button 
                     onClick={handleInstallClick}
                     className="bg-mv-yellow-400 hover:bg-mv-yellow-500 text-mv-blue-900 p-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm animate-pulse"
                   >
                      <Download className="w-5 h-5" />
                      <span className="text-xs font-bold hidden sm:block">Instalar App</span>
                   </button>
               )}

               <button 
                 onClick={() => setIsSommelierOpen(true)}
                 className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors flex items-center gap-1.5"
               >
                  <ChefHat className="w-5 h-5 text-mv-yellow-400" />
                  <span className="text-xs font-bold text-white hidden sm:block">Sommelier</span>
               </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto min-h-[calc(100vh-140px)] bg-slate-50">
        {activeTab === 'vender' && renderPOS()}
        {activeTab === 'pedidos' && renderOrders()}
        {activeTab === 'clientes' && renderCustomers()}
        {activeTab === 'estatisticas' && renderStats()}
        {activeTab === 'historico' && renderHistory()}
        {activeTab === 'produtos' && renderProducts()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-30 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-1">
           <button onClick={() => setActiveTab('vender')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'vender' ? 'text-mv-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Store className={`w-6 h-6 ${activeTab === 'vender' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-bold">Vender</span>
           </button>
           <button onClick={() => setActiveTab('pedidos')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'pedidos' ? 'text-mv-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <ClipboardList className="w-6 h-6" />
              <span className="text-[10px] font-bold">Pedidos</span>
           </button>
           <button onClick={() => setActiveTab('clientes')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'clientes' ? 'text-mv-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Users className="w-6 h-6" />
              <span className="text-[10px] font-bold">Clientes</span>
           </button>
           <button onClick={() => setActiveTab('estatisticas')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'estatisticas' ? 'text-mv-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <BarChart3 className="w-6 h-6" />
              <span className="text-[10px] font-bold">Stats</span>
           </button>
           <button onClick={() => setActiveTab('produtos')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'produtos' ? 'text-mv-blue-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <Package className="w-6 h-6" />
              <span className="text-[10px] font-bold">Prod</span>
           </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={handleRemoveFromCart}
        onEdit={handleEditCartItem}
        onClear={handleClearCart}
        onCheckout={openCheckout}
        onSaveOrder={handleSaveOrder}
      />

      {/* Sommelier Chat */}
      <SommelierChat 
        isOpen={isSommelierOpen} 
        onClose={() => setIsSommelierOpen(false)} 
      />

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
             <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
               <X className="w-6 h-6" />
             </button>

             <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
               <Wallet className="w-6 h-6 text-mv-blue-600" />
               Finalizar Venda
             </h3>
             <p className="text-slate-500 mb-2 text-sm">Como o cliente vai pagar?</p>
             
             {/* Discount Summary */}
             {currentDiscount > 0 && (
                 <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm font-bold flex justify-between">
                     <span>Desconto aplicado:</span>
                     <span>- {formatCurrency(currentDiscount)}</span>
                 </div>
             )}

             <div className="space-y-3 mb-6">
                <button 
                  onClick={() => setSelectedPayment('DINHEIRO')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${selectedPayment === 'DINHEIRO' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                    {selectedPayment === 'DINHEIRO' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                  </div>
                  <span>Dinheiro</span>
                </button>
                <button 
                  onClick={() => setSelectedPayment('PIX')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${selectedPayment === 'PIX' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                    {selectedPayment === 'PIX' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <span>PIX</span>
                </button>
                <button 
                  onClick={() => setSelectedPayment('FIADO')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${selectedPayment === 'FIADO' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                    {selectedPayment === 'FIADO' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                  <span>Fiado / Pendura</span>
                </button>
             </div>

             {/* Customer Name Input (Required for Fiado) */}
             {(selectedPayment === 'FIADO' || selectedPayment) && (
               <div className="animate-in slide-in-from-top fade-in mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    {selectedPayment === 'FIADO' ? 'Nome do Cliente (Obrigatório)' : 'Nome do Cliente (Opcional)'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: João da Silva"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-mv-blue-500 outline-none transition-colors font-medium"
                      list="customer-suggestions"
                    />
                    <datalist id="customer-suggestions">
                       {customers.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
               </div>
             )}

             <button 
               onClick={finalizeOrder}
               disabled={!selectedPayment || (selectedPayment === 'FIADO' && !customerName.trim())}
               className="w-full bg-mv-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-mv-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
             >
               Confirmar (Total: {formatCurrency(Math.max(0, cartSubtotal - currentDiscount))})
             </button>
          </div>
        </div>
      )}

      {/* Debt Payment Modal */}
      {isDebtModalOpen && selectedDebtor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDebtModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
             <h3 className="text-xl font-bold text-slate-800 mb-2">Abater Dívida</h3>
             <p className="text-slate-500 mb-4">Cliente: <span className="font-bold text-slate-700">{selectedDebtor.name}</span></p>
             
             <div className="mb-4">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor do Pagamento</label>
                 <div className="flex items-center gap-2 border border-slate-300 rounded-xl p-3 focus-within:ring-2 focus-within:ring-mv-blue-500">
                     <span className="text-slate-500 font-bold">R$</span>
                     <input 
                        type="number" 
                        value={debtPaymentAmount}
                        onChange={(e) => setDebtPaymentAmount(e.target.value)}
                        className="w-full outline-none font-bold text-lg text-slate-800"
                        autoFocus
                     />
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-6">
                 <button onClick={() => setDebtPaymentMethod('DINHEIRO')} className={`p-3 rounded-lg border font-bold text-sm ${debtPaymentMethod === 'DINHEIRO' ? 'bg-green-50 border-green-500 text-green-700' : 'border-slate-200 text-slate-500'}`}>Dinheiro</button>
                 <button onClick={() => setDebtPaymentMethod('PIX')} className={`p-3 rounded-lg border font-bold text-sm ${debtPaymentMethod === 'PIX' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500'}`}>Pix</button>
             </div>

             <div className="flex gap-3">
                 <button onClick={() => setIsDebtModalOpen(false)} className="flex-1 py-3 bg-slate-100 font-bold text-slate-600 rounded-xl">Cancelar</button>
                 <button onClick={handleDebtPayment} className="flex-1 py-3 bg-mv-blue-700 text-white font-bold rounded-xl shadow-lg">Confirmar</button>
             </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddCustomerOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-mv-blue-600" />
              Novo Cliente
            </h3>
            
            <div className="space-y-3">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo *</label>
                  <input value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-mv-blue-500 outline-none" placeholder="Ex: João da Silva"/>
               </div>
               <div className="grid grid-cols-2 gap-3">
                   <div><label className="text-xs font-bold text-slate-500 uppercase">CPF</label><input value={newCustomer.cpf} onChange={e => setNewCustomer({...newCustomer, cpf: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 outline-none" placeholder="000.000.000-00"/></div>
                   <div><label className="text-xs font-bold text-slate-500 uppercase">Telefone</label><input value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 outline-none" placeholder="(00) 00000-0000"/></div>
               </div>
               <div><label className="text-xs font-bold text-slate-500 uppercase">Endereço</label><input value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 outline-none" placeholder="Rua, Número, Bairro"/></div>
               <div><label className="text-xs font-bold text-slate-500 uppercase">Observações</label><textarea value={newCustomer.notes} onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})} className="w-full p-3 rounded-lg border border-slate-200 outline-none h-20 resize-none" placeholder="Preferências..."/></div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsAddCustomerOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>
              <button onClick={handleAddCustomer} className="flex-1 py-3 rounded-xl font-bold text-white bg-mv-blue-600 hover:bg-mv-blue-700 shadow-lg">Salvar Cliente</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW UPDATED Product Management Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {setIsProductModalOpen(false); setIsEditingProductMode(false);}} />
          <div className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <Package className="w-6 h-6 text-mv-blue-600" />
                    {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <button onClick={() => {setIsProductModalOpen(false); setIsEditingProductMode(false);}} className="p-1 hover:bg-slate-100 rounded-full">
                    <X className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
                 <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome do Produto</label>
                        <input 
                            value={editingProduct.name || ''}
                            onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-mv-blue-500 outline-none"
                            placeholder="Ex: Queijo Prato"
                        />
                    </div>

                    {/* Type Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo de Venda</label>
                        <div className="relative">
                            <select
                                value={editingProduct.unitType || 'KG'}
                                onChange={(e) => setEditingProduct({...editingProduct, unitType: e.target.value as UnitType})}
                                className="w-full p-3 pr-10 rounded-lg border border-slate-200 focus:ring-2 focus:ring-mv-blue-500 outline-none appearance-none bg-white font-bold text-slate-700"
                            >
                                <option value="KG">Fracionado (Por Peso - kg/g)</option>
                                <option value="UN">Por Unidade (un)</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Prices Grid */}
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Custo ({editingProduct.unitType === 'UN' ? 'Un' : 'Kg'})</label>
                            <input 
                                type="number"
                                value={editingProduct.costPrice || ''}
                                onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value)})}
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-mv-blue-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Venda ({editingProduct.unitType === 'UN' ? 'Un' : 'Kg'})</label>
                            <input 
                                type="number"
                                value={editingProduct.price || ''}
                                onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-mv-blue-500 outline-none font-bold text-slate-800"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Profit Preview */}
                    {editingProduct.price && editingProduct.costPrice && (
                         <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex justify-between items-center">
                             <div className="text-xs font-bold text-green-700 uppercase">Margem Estimada</div>
                             <div className="text-right">
                                 <span className="block font-bold text-green-800">
                                     + {formatCurrency(editingProduct.price - editingProduct.costPrice)}
                                 </span>
                                 <span className="text-xs text-green-600 font-medium">
                                     {((editingProduct.price - editingProduct.costPrice) / editingProduct.price * 100).toFixed(1)}% de margem
                                 </span>
                             </div>
                         </div>
                    )}

                    {/* Stock Control */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                             <span className="text-sm font-bold text-slate-600">Controlar Estoque?</span>
                             <button 
                               onClick={() => setEditingProduct({...editingProduct, trackStock: !editingProduct.trackStock})}
                               className={`w-12 h-6 rounded-full transition-colors relative ${editingProduct.trackStock ? 'bg-mv-blue-600' : 'bg-slate-300'}`}
                             >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingProduct.trackStock ? 'left-7' : 'left-1'}`} />
                             </button>
                        </div>
                        {editingProduct.trackStock && (
                            <div className="animate-in fade-in slide-in-from-top-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Quantidade em Estoque</label>
                                <input 
                                    type="number"
                                    value={editingProduct.stock || ''}
                                    onChange={e => setEditingProduct({...editingProduct, stock: parseFloat(e.target.value)})}
                                    className="w-full p-2 mt-1 rounded border border-slate-300 outline-none"
                                    placeholder="0"
                                />
                            </div>
                        )}
                    </div>
                    
                    {/* Image */}
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Imagem do Produto</label>
                       <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                <img src={editingProduct.image || IMAGES.HERO_CHEESE} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold text-slate-600 transition-colors">
                                Alterar Imagem
                                <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} />
                            </label>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        <button 
                            onClick={() => {setIsEditingProductMode(false); setEditingProduct({}); setIsProductModalOpen(false);}}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSaveProduct}
                            className="flex-1 py-3 bg-mv-blue-700 text-white font-bold rounded-xl shadow-lg"
                        >
                            Salvar Produto
                        </button>
                    </div>
                 </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
