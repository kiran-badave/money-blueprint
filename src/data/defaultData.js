// Default example state. Line items sum to the 50/30/20 split of a ₹1,00,000 salary.
export const CHECKLIST_ITEMS = [
  { id: 'expenses', label: 'Check expenses against your budget' },
  { id: 'sips', label: 'Review SIPs and account balances' },
  { id: 'goals', label: 'Update your goal tracker' },
  { id: 'unnecessary', label: 'Identify unnecessary spending' },
];

export const currentMonthKey = () => new Date().toISOString().slice(0, 7); // YYYY-MM

export const defaultData = () => ({
  version: 1,
  salary: 100000,
  salaryDay: 1,
  lineItems: [
    { id: 'li1', name: 'Rent', category: 'needs', amount: 25000 },
    { id: 'li2', name: 'EMIs', category: 'needs', amount: 10000 },
    { id: 'li3', name: 'Groceries', category: 'needs', amount: 8000 },
    { id: 'li4', name: 'Utilities & transport', category: 'needs', amount: 4000 },
    { id: 'li5', name: 'Annual bills (insurance)', category: 'needs', amount: 3000 },
    { id: 'li6', name: 'Shopping', category: 'wants', amount: 10000 },
    { id: 'li7', name: 'Dining', category: 'wants', amount: 8000 },
    { id: 'li8', name: 'Travel', category: 'wants', amount: 12000 },
    { id: 'li9', name: 'SIPs & investments', category: 'savings', amount: 20000 },
  ],
  emergencyFundSaved: 150000,
  sinkingFund: [
    { id: 'sf1', name: 'Health insurance', amount: 24000 },
    { id: 'sf2', name: 'Car insurance', amount: 12000 },
  ],
  goals: [
    { id: 'g1', name: 'Vacation', years: 1, where: '' },
    { id: 'g2', name: 'Car down payment', years: 3, where: '' },
    { id: 'g3', name: 'Retirement', years: 25, where: '' },
  ],
  checklist: { month: currentMonthKey(), done: {} },
  updatedAt: null,
});
