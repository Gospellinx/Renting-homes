export type PropertyType = "rent" | "sale";

export interface Property {
  id: number;
  type: PropertyType;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  size: string;
  image: string;
  verified: boolean;
  featured: boolean;
  propertyType: string;
  isExternal?: boolean;
  externalUrl?: string;
}

export const allProperties: Property[] = [
  // Rental Properties - Lagos
  { id: 1, type: "rent", title: "Modern 3 Bedroom Apartment", location: "Victoria Island, Lagos", price: "₦3.5M/year", beds: 3, baths: 2, size: "1,500 sqft", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", verified: true, featured: true, propertyType: "Apartment" },
  { id: 2, type: "rent", title: "Luxury 4 Bedroom Duplex", location: "Lekki Phase 1, Lagos", price: "₦8M/year", beds: 4, baths: 4, size: "3,200 sqft", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", verified: true, featured: false, propertyType: "Duplex" },
  { id: 3, type: "rent", title: "Cozy 2 Bedroom Flat", location: "Ikeja GRA, Lagos", price: "₦2.2M/year", beds: 2, baths: 2, size: "1,100 sqft", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", verified: true, featured: false, propertyType: "Flat" },
  { id: 4, type: "rent", title: "Executive 5 Bedroom Mansion", location: "Ikoyi, Lagos", price: "₦15M/year", beds: 5, baths: 6, size: "5,500 sqft", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", verified: true, featured: true, propertyType: "Mansion" },
  { id: 5, type: "rent", title: "Studio Apartment", location: "Yaba, Lagos", price: "₦800K/year", beds: 1, baths: 1, size: "450 sqft", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400", verified: false, featured: false, propertyType: "Studio" },
  { id: 6, type: "rent", title: "3 Bedroom Bungalow", location: "Ajah, Lagos", price: "₦1.8M/year", beds: 3, baths: 2, size: "1,800 sqft", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400", verified: true, featured: false, propertyType: "Bungalow" },
  { id: 7, type: "rent", title: "Penthouse Suite", location: "Banana Island, Lagos", price: "₦25M/year", beds: 4, baths: 4, size: "4,000 sqft", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", verified: true, featured: true, propertyType: "Penthouse" },
  { id: 8, type: "rent", title: "2 Bedroom Apartment", location: "Surulere, Lagos", price: "₦1.2M/year", beds: 2, baths: 1, size: "900 sqft", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400", verified: true, featured: false, propertyType: "Apartment" },
  
  // Abuja Rental Properties
  { id: 9, type: "rent", title: "4 Bedroom Semi-Detached", location: "Asokoro, Abuja", price: "₦6M/year", beds: 4, baths: 3, size: "2,800 sqft", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", verified: true, featured: true, propertyType: "Semi-Detached" },
  { id: 10, type: "rent", title: "3 Bedroom Terrace", location: "Maitama, Abuja", price: "₦5M/year", beds: 3, baths: 3, size: "2,200 sqft", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400", verified: true, featured: false, propertyType: "Terrace" },
  { id: 11, type: "rent", title: "Luxury Villa", location: "Wuse 2, Abuja", price: "₦12M/year", beds: 5, baths: 5, size: "4,500 sqft", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400", verified: true, featured: true, propertyType: "Villa" },
  { id: 12, type: "rent", title: "2 Bedroom Flat", location: "Garki, Abuja", price: "₦2.5M/year", beds: 2, baths: 2, size: "1,000 sqft", image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400", verified: true, featured: false, propertyType: "Flat" },
  { id: 13, type: "rent", title: "Executive 4 Bedroom", location: "Jabi, Abuja", price: "₦4.5M/year", beds: 4, baths: 3, size: "2,400 sqft", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400", verified: true, featured: false, propertyType: "Apartment" },
  { id: 14, type: "rent", title: "Modern Studio", location: "Gwarinpa, Abuja", price: "₦1.2M/year", beds: 1, baths: 1, size: "550 sqft", image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400", verified: false, featured: false, propertyType: "Studio" },

  // Shops for rent in Abuja
  { id: 15, type: "rent", title: "Standard Shop Space", location: "Wuse 2, Abuja", price: "₦2.5M/year", beds: 0, baths: 1, size: "300 sqft", image: "https://images.unsplash.com/photo-1582212952862-2cfba27a69ed?w=400", verified: true, featured: true, propertyType: "Shop" },
  { id: 16, type: "rent", title: "Premium Retail Store", location: "Maitama, Abuja", price: "₦8M/year", beds: 0, baths: 2, size: "850 sqft", image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=400", verified: true, featured: false, propertyType: "Shop" },
  { id: 17, type: "rent", title: "Plaza Corner Shop", location: "Garki, Abuja", price: "₦1.5M/year", beds: 0, baths: 1, size: "200 sqft", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", verified: true, featured: false, propertyType: "Shop" },
  { id: 18, type: "rent", title: "Large Showroom", location: "Jabi, Abuja", price: "₦15M/year", beds: 0, baths: 4, size: "2,500 sqft", image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400", verified: true, featured: true, propertyType: "Shop" },
  { id: 19, type: "rent", title: "Boutique Space", location: "Gwarinpa, Abuja", price: "₦3.2M/year", beds: 0, baths: 1, size: "450 sqft", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", verified: true, featured: false, propertyType: "Shop" },
  
  // Buy Properties - Lagos
  { id: 101, type: "sale", title: "Premium 4 Bedroom Duplex", location: "Victoria Island, Lagos", price: "₦180M", beds: 4, baths: 4, size: "3,500 sqft", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", verified: true, featured: true, propertyType: "Duplex" },
  { id: 102, type: "sale", title: "Waterfront Mansion", location: "Banana Island, Lagos", price: "₦850M", beds: 6, baths: 7, size: "8,000 sqft", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", verified: true, featured: true, propertyType: "Mansion" },
  { id: 103, type: "sale", title: "3 Bedroom Apartment", location: "Lekki Phase 1, Lagos", price: "₦75M", beds: 3, baths: 3, size: "1,800 sqft", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", verified: true, featured: false, propertyType: "Apartment" },
  { id: 104, type: "sale", title: "5 Bedroom Detached House", location: "Ikoyi, Lagos", price: "₦350M", beds: 5, baths: 5, size: "4,500 sqft", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", verified: true, featured: true, propertyType: "Detached" },
  { id: 105, type: "sale", title: "2 Bedroom Starter Home", location: "Ajah, Lagos", price: "₦35M", beds: 2, baths: 2, size: "1,200 sqft", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400", verified: true, featured: false, propertyType: "House" },
  { id: 106, type: "sale", title: "Luxury Penthouse", location: "Eko Atlantic, Lagos", price: "₦450M", beds: 4, baths: 4, size: "4,200 sqft", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", verified: true, featured: true, propertyType: "Penthouse" },
  
  // Buy Properties - Abuja
  { id: 107, type: "sale", title: "Executive 5 Bedroom Villa", location: "Asokoro, Abuja", price: "₦280M", beds: 5, baths: 5, size: "5,000 sqft", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400", verified: true, featured: true, propertyType: "Villa" },
  { id: 108, type: "sale", title: "4 Bedroom Terrace", location: "Maitama, Abuja", price: "₦120M", beds: 4, baths: 4, size: "2,800 sqft", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400", verified: true, featured: false, propertyType: "Terrace" },
  { id: 109, type: "sale", title: "3 Bedroom Semi-Detached", location: "Wuse 2, Abuja", price: "₦85M", beds: 3, baths: 3, size: "2,000 sqft", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400", verified: true, featured: false, propertyType: "Semi-Detached" },
  { id: 110, type: "sale", title: "Luxury Estate Home", location: "Gwarinpa, Abuja", price: "₦95M", beds: 4, baths: 4, size: "2,600 sqft", image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400", verified: true, featured: false, propertyType: "House" },
  { id: 111, type: "sale", title: "Presidential Villa", location: "Asokoro Extension, Abuja", price: "₦500M", beds: 7, baths: 8, size: "10,000 sqft", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400", verified: true, featured: true, propertyType: "Villa" },
  { id: 112, type: "sale", title: "Modern 2 Bedroom Flat", location: "Jabi, Abuja", price: "₦45M", beds: 2, baths: 2, size: "1,100 sqft", image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400", verified: true, featured: false, propertyType: "Flat" },

  // Shops for sale in Abuja
  { id: 113, type: "sale", title: "Commercial Plaza Building", location: "Wuse 2, Abuja", price: "₦850M", beds: 0, baths: 10, size: "15,000 sqft", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400", verified: true, featured: true, propertyType: "Commercial" },
  { id: 114, type: "sale", title: "Shop Space in Mall", location: "Central Business District, Abuja", price: "₦120M", beds: 0, baths: 1, size: "600 sqft", image: "https://images.unsplash.com/photo-1567449303183-ae0d6ed1498e?w=400", verified: true, featured: false, propertyType: "Shop" }
];
