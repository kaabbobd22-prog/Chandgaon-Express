export const calcDeliveryFee = (items = []) => {
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalKg  = items.reduce((s, i) => {
    if (i.unit?.toLowerCase().includes('kg') || i.unit?.toLowerCase().includes('কেজি')) return s + i.quantity;
    return s;
  }, 0);
  if (totalKg >= 50) return 100;
  if (totalKg >= 25) return 70;
  if (totalKg >= 10) return 50;
  if (totalQty > 3)  return 30;
  return 10;
};

export const formatCurrency = (n) => `৳${Number(n).toFixed(0)}`;

export const ORDER_STATUS = {
  pending:    { label: 'Pending',    color: 'text-yellow-600 bg-yellow-50',  step: 0 },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-600   bg-blue-50',    step: 1 },
  preparing:  { label: 'Preparing',  color: 'text-purple-600 bg-purple-50',  step: 2 },
  picked:     { label: 'On the Way', color: 'text-accent     bg-orange-50',  step: 3 },
  delivered:  { label: 'Delivered',  color: 'text-primary    bg-primary-50', step: 4 },
  cancelled:  { label: 'Cancelled',  color: 'text-red-600    bg-red-50',     step: -1 },
};
