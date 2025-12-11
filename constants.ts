
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatWeight = (grams: number) => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`;
  }
  return `${grams}g`;
};

export const formatUnit = (quantity: number) => {
  return `${quantity} un`;
};

// Placeholder images
export const IMAGES = {
  HERO_CHEESE: "https://picsum.photos/id/102/1200/600",
  PRODUCT_SLICED: "https://picsum.photos/id/431/800/800",
  PRODUCT_BLOCK: "https://picsum.photos/id/525/800/800",
};
