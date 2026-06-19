export const mockPrices = [
  { id: '1', crop: 'Maize', market: 'Techiman', price: 220, unit: '100kg bag', trend: 'up' },
  { id: '2', crop: 'Cocoa', market: 'Kumasi', price: 1850, unit: '64kg bag', trend: 'up' },
  { id: '3', crop: 'Cassava', market: 'Ejura', price: 95, unit: '100kg bag', trend: 'down' },
  { id: '4', crop: 'Tomato', market: 'Techiman', price: 480, unit: 'crate', trend: 'down' },
  { id: '5', crop: 'Rice (paddy)', market: 'Tamale', price: 310, unit: '100kg bag', trend: 'flat' },
  { id: '6', crop: 'Yam', market: 'Ejura', price: 140, unit: '100 tubers', trend: 'up' },
];

export const mockListings = [
  { id: 'l1', crop: 'Maize', quantity: '15 bags', seller: 'Kwame A.', location: 'Techiman', price: 215 },
  { id: 'l2', crop: 'Cocoa', quantity: '8 bags', seller: 'Akosua B.', location: 'Kumasi', price: 1820 },
  { id: 'l3', crop: 'Tomato', quantity: '20 crates', seller: 'Yaw O.', location: 'Techiman', price: 460 },
];

export const mockFarmer = {
  id: 'demo-001',
  name: '',
  phone: '',
  region: '',
  registered: false,
  creditScore: 0,
  walletBalance: 0,
  coopGroup: 'Techiman Maize Growers',
  coopSavings: 0,
};

export const mockSubsidyStatus = {
  programme: 'Planting for Food and Jobs',
  status: 'Pending disbursement',
  amount: 350,
  expectedDate: 'Within 5 business days',
};
