export interface ServicePackage {
  id: string;
  name: string;
  category: 'Website Development' | 'Digital Marketing & SEO' | 'Landing Pages';
  rate: number;
  pricingLabel: string;
  description: string;
  hsnSac: string;
  unit: string;
}

export const PREDEFINED_SERVICES: ServicePackage[] = [
  {
    "id": "basic-website",
    "name": "🌐 Basic Website",
    "category": "Website Development",
    "rate": 5000,
    "pricingLabel": "₹5,000 One-Time",
    "description": "• Landing / Home Page\n• About Us Page\n• Services Page\n• Contact Page\n• Contact Form\n• Lead Generation Form\n• WhatsApp Integration\n• Click-to-Call Button\n• Google Maps Integration\n• Basic SEO Setup\n• Mobile Responsive Design\n• Basic Speed Optimization\n• Website Deployment",
    "hsnSac": "998314",
    "unit": "NOS"
  },
  {
    "id": "business-website",
    "name": "💼 Business Website",
    "category": "Website Development",
    "rate": 10000,
    "pricingLabel": "₹10,000 One-Time",
    "description": "• Up to 10 Pages\n• Professional & Modern Design\n• Detailed Service / Treatment Pages\n• Complete Service Descriptions\n• About Hospital / Centre\n• Doctor / Team Section\n• Contact & Lead Forms\n• WhatsApp Integration\n• Google Maps Integration\n• Blog Section\n• Advanced On-Page SEO\n• SEO-Friendly Page Structure\n• Mobile & Tablet Responsive\n• Basic Speed Optimization\n• Social Media Integration\n• 2 Rounds of Website Edits",
    "hsnSac": "998314",
    "unit": "NOS"
  },
  {
    "id": "business-pro-website",
    "name": "🚀 Business Pro Website",
    "category": "Website Development",
    "rate": 15000,
    "pricingLabel": "₹15,000 One-Time",
    "description": "• Premium Professional Design\n• 8–10+ Pages\n• Detailed Service / Treatment Pages\n• Advanced SEO Setup\n• SEO-Friendly Website Structure\n• Appointment / Inquiry System\n• Payment Integration\n• Lead Generation Forms\n• WhatsApp Integration\n• Social Media Integration\n• Google Maps Integration\n• Doctor / Specialist Profiles\n• Blog Section\n• Mobile Responsive Design\n• Website Speed Optimization\n• Conversion-Focused Call-to-Actions\n• Analytics & Basic Tracking\n• Website Deployment\n• 1 Month Free Website Support",
    "hsnSac": "998314",
    "unit": "NOS"
  },
  {
    "id": "ecommerce-website",
    "name": "🛒 E-Commerce Website",
    "category": "Website Development",
    "rate": 25000,
    "pricingLabel": "₹25,000 One-Time",
    "description": "• Professional E-Commerce Design\n• Product Catalogue\n• Product Categories\n• Product Detail Pages\n• Shopping Cart\n• Checkout System\n• Payment Gateway Integration\n• Customer Login / Registration\n• Order Management\n• WhatsApp Integration\n• Product Search & Filtering\n• Coupon / Discount Functionality\n• Basic Analytics & Tracking\n• Advanced SEO\n• Mobile Responsive Design\n• Website Speed Optimization\n• Social Media Integration\n• 1 Month Free Website Support",
    "hsnSac": "998314",
    "unit": "NOS"
  },
  {
    "id": "single-landing-page",
    "name": "📄 Single Landing Page",
    "category": "Landing Pages",
    "rate": 2500,
    "pricingLabel": "₹2,500 One-Time",
    "description": "• High-Converting Landing Page\n• Service / Treatment Information\n• Strong Call-to-Actions\n• Lead Generation Form\n• WhatsApp Integration\n• Click-to-Call Button\n• Google Maps\n• Basic SEO\n• Mobile Responsive Design\n• Conversion-Focused Layout",
    "hsnSac": "998314",
    "unit": "NOS"
  },
  {
    "id": "google-business-profile-management",
    "name": "📍 Google Business Profile Management",
    "category": "Digital Marketing & SEO",
    "rate": 7500,
    "pricingLabel": "₹7,500/Month",
    "description": "Profile Optimization\n• Complete Google Business Profile Optimization\n• Business Category Optimization\n• Services & Information Optimization\n• Business Description Optimization\n• Keyword Optimization\n• Photos & Profile Optimization\n• Google Maps Visibility Improvement\n\nGoogle Posts\n• 12–15 Google Posts Per Month\n• Service-Based Posts\n• Awareness / Educational Posts\n• Promotional Posts\n• Healthcare Content\n\nReview Management\n• Magic Review QR Setup\n• Magic Review Link\n• Review Monitoring\n• Professional Review Replies\n• Review Generation Strategy\n\nLocal SEO\n• Local Keyword Optimization\n• Local Citations\n• 30 High-Quality Backlinks / Month\n• Competitor Analysis\n• Local Ranking Improvement\n• Monthly Performance Report",
    "hsnSac": "998313",
    "unit": "MONTH"
  },
  {
    "id": "google-ads-management",
    "name": "🔎 Google Ads Management",
    "category": "Digital Marketing & SEO",
    "rate": 7500,
    "pricingLabel": "₹7,500/Month",
    "description": "Campaign Setup\n• Google Ads Account Setup\n• Search Campaign Setup\n• Location-Based Targeting\n• Keyword Research\n• Negative Keyword Research\n• Ad Copy Creation\n• Lead & Call Campaigns\n• Conversion Tracking\n\nOptimization\n• Regular Campaign Monitoring\n• Keyword Optimization\n• Search Term Analysis\n• Bid Optimization\n• Audience Optimization\n• Ad Performance Optimization\n• Cost-per-Lead Optimization\n\nReporting\n• Monthly Performance Report\n• Leads Generated\n• Cost Per Lead\n• Campaign Performance\n• Recommendations for Improvement",
    "hsnSac": "998313",
    "unit": "MONTH"
  },
  {
    "id": "meta-ads-management",
    "name": "📱 Meta Ads Management",
    "category": "Digital Marketing & SEO",
    "rate": 7500,
    "pricingLabel": "₹7,500/Month",
    "description": "Campaign Management\n• Facebook & Instagram Ads\n• Lead Generation Campaigns\n• WhatsApp Lead Campaigns\n• Location-Based Targeting\n\nAudience Research\n• Interest & Demographic Targeting\n• Retargeting Campaigns\n\nOptimization\n• Ad Copy & Campaign Strategy\n• Creative Testing\n• Audience Optimization\n• A/B Testing\n• Campaign Monitoring\n• Cost-per-Lead Optimization\n\nReporting\n• Monthly Performance Report\n• Leads Generated\n• Cost Per Lead\n• Audience Performance\n• Campaign Recommendations",
    "hsnSac": "998313",
    "unit": "MONTH"
  },
  {
    "id": "social-media-management",
    "name": "📱 Social Media Management",
    "category": "Digital Marketing & SEO",
    "rate": 7500,
    "pricingLabel": "₹7,500/Month",
    "description": "Content Creation\n• 4 Static Posts / Month\n• 4 Carousel Posts / Month\n• 4 Reels / Month\n• Reel Editing from Raw Videos Provided by Client\n• Facebook Cover Design\n• Instagram Profile Optimization\n• Instagram Bio Optimization\n• Facebook Page Optimization\n\nContent Strategy\n• Monthly Content Planning\n• Healthcare-Focused Content Strategy\n• Brand Positioning\n• Content Themes & Topics\n• Audience-Focused Content\n• Brand Consistency\n\nCopywriting & Branding\n• High-Value Captions\n• Relevant Hashtag Strategy\n• Strong Call-to-Actions\n• Brand Voice Development\n• Consistent Visual Branding\n\nPlatforms\n• Facebook + Instagram",
    "hsnSac": "998313",
    "unit": "MONTH"
  }
];
