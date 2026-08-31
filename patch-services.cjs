const fs = require('fs');

const services = [
  {
    id: 'basic-website',
    name: '🌐 Basic Website',
    category: 'Website Development',
    rate: 5000,
    pricingLabel: '₹5,000 One-Time',
    description: `• Landing / Home Page
• About Us Page
• Services Page
• Contact Page
• Contact Form
• Lead Generation Form
• WhatsApp Integration
• Click-to-Call Button
• Google Maps Integration
• Basic SEO Setup
• Mobile Responsive Design
• Basic Speed Optimization
• Website Deployment`,
    hsnSac: '998314',
    unit: 'NOS'
  },
  {
    id: 'business-website',
    name: '💼 Business Website',
    category: 'Website Development',
    rate: 10000,
    pricingLabel: '₹10,000 One-Time',
    description: `• Up to 10 Pages
• Professional & Modern Design
• Detailed Service / Treatment Pages
• Complete Service Descriptions
• About Hospital / Centre
• Doctor / Team Section
• Contact & Lead Forms
• WhatsApp Integration
• Google Maps Integration
• Blog Section
• Advanced On-Page SEO
• SEO-Friendly Page Structure
• Mobile & Tablet Responsive
• Basic Speed Optimization
• Social Media Integration
• 2 Rounds of Website Edits`,
    hsnSac: '998314',
    unit: 'NOS'
  },
  {
    id: 'business-pro-website',
    name: '🚀 Business Pro Website',
    category: 'Website Development',
    rate: 15000,
    pricingLabel: '₹15,000 One-Time',
    description: `• Premium Professional Design
• 8–10+ Pages
• Detailed Service / Treatment Pages
• Advanced SEO Setup
• SEO-Friendly Website Structure
• Appointment / Inquiry System
• Payment Integration
• Lead Generation Forms
• WhatsApp Integration
• Social Media Integration
• Google Maps Integration
• Doctor / Specialist Profiles
• Blog Section
• Mobile Responsive Design
• Website Speed Optimization
• Conversion-Focused Call-to-Actions
• Analytics & Basic Tracking
• Website Deployment
• 1 Month Free Website Support`,
    hsnSac: '998314',
    unit: 'NOS'
  },
  {
    id: 'ecommerce-website',
    name: '🛒 E-Commerce Website',
    category: 'Website Development',
    rate: 25000,
    pricingLabel: '₹25,000 One-Time',
    description: `• Professional E-Commerce Design
• Product Catalogue
• Product Categories
• Product Detail Pages
• Shopping Cart
• Checkout System
• Payment Gateway Integration
• Customer Login / Registration
• Order Management
• WhatsApp Integration
• Product Search & Filtering
• Coupon / Discount Functionality
• Basic Analytics & Tracking
• Advanced SEO
• Mobile Responsive Design
• Website Speed Optimization
• Social Media Integration
• 1 Month Free Website Support`,
    hsnSac: '998314',
    unit: 'NOS'
  },
  {
    id: 'single-landing-page',
    name: '📄 Single Landing Page',
    category: 'Landing Pages',
    rate: 2500,
    pricingLabel: '₹2,500 One-Time',
    description: `• High-Converting Landing Page
• Service / Treatment Information
• Strong Call-to-Actions
• Lead Generation Form
• WhatsApp Integration
• Click-to-Call Button
• Google Maps
• Basic SEO
• Mobile Responsive Design
• Conversion-Focused Layout`,
    hsnSac: '998314',
    unit: 'NOS'
  },
  {
    id: 'google-business-profile-management',
    name: '📍 Google Business Profile Management',
    category: 'Digital Marketing & SEO',
    rate: 7500,
    pricingLabel: '₹7,500/Month',
    description: `Profile Optimization
• Complete Google Business Profile Optimization
• Business Category Optimization
• Services & Information Optimization
• Business Description Optimization
• Keyword Optimization
• Photos & Profile Optimization
• Google Maps Visibility Improvement

Google Posts
• 12–15 Google Posts Per Month
• Service-Based Posts
• Awareness / Educational Posts
• Promotional Posts
• Healthcare Content

Review Management
• Magic Review QR Setup
• Magic Review Link
• Review Monitoring
• Professional Review Replies
• Review Generation Strategy

Local SEO
• Local Keyword Optimization
• Local Citations
• 30 High-Quality Backlinks / Month
• Competitor Analysis
• Local Ranking Improvement
• Monthly Performance Report`,
    hsnSac: '998313',
    unit: 'MONTH'
  },
  {
    id: 'google-ads-management',
    name: '🔎 Google Ads Management',
    category: 'Digital Marketing & SEO',
    rate: 7500,
    pricingLabel: '₹7,500/Month',
    description: `Campaign Setup
• Google Ads Account Setup
• Search Campaign Setup
• Location-Based Targeting
• Keyword Research
• Negative Keyword Research
• Ad Copy Creation
• Lead & Call Campaigns
• Conversion Tracking

Optimization
• Regular Campaign Monitoring
• Keyword Optimization
• Search Term Analysis
• Bid Optimization
• Audience Optimization
• Ad Performance Optimization
• Cost-per-Lead Optimization

Reporting
• Monthly Performance Report
• Leads Generated
• Cost Per Lead
• Campaign Performance
• Recommendations for Improvement`,
    hsnSac: '998313',
    unit: 'MONTH'
  },
  {
    id: 'meta-ads-management',
    name: '📱 Meta Ads Management',
    category: 'Digital Marketing & SEO',
    rate: 7500,
    pricingLabel: '₹7,500/Month',
    description: `Campaign Management
• Facebook & Instagram Ads
• Lead Generation Campaigns
• WhatsApp Lead Campaigns
• Location-Based Targeting

Audience Research
• Interest & Demographic Targeting
• Retargeting Campaigns

Optimization
• Ad Copy & Campaign Strategy
• Creative Testing
• Audience Optimization
• A/B Testing
• Campaign Monitoring
• Cost-per-Lead Optimization

Reporting
• Monthly Performance Report
• Leads Generated
• Cost Per Lead
• Audience Performance
• Campaign Recommendations`,
    hsnSac: '998313',
    unit: 'MONTH'
  },
  {
    id: 'social-media-management',
    name: '📱 Social Media Management',
    category: 'Digital Marketing & SEO',
    rate: 7500,
    pricingLabel: '₹7,500/Month',
    description: `Content Creation
• 4 Static Posts / Month
• 4 Carousel Posts / Month
• 4 Reels / Month
• Reel Editing from Raw Videos Provided by Client
• Facebook Cover Design
• Instagram Profile Optimization
• Instagram Bio Optimization
• Facebook Page Optimization

Content Strategy
• Monthly Content Planning
• Healthcare-Focused Content Strategy
• Brand Positioning
• Content Themes & Topics
• Audience-Focused Content
• Brand Consistency

Copywriting & Branding
• High-Value Captions
• Relevant Hashtag Strategy
• Strong Call-to-Actions
• Brand Voice Development
• Consistent Visual Branding

Platforms
• Facebook + Instagram`,
    hsnSac: '998313',
    unit: 'MONTH'
  }
];

const fileContent = `export interface ServicePackage {
  id: string;
  name: string;
  category: 'Website Development' | 'Digital Marketing & SEO' | 'Landing Pages';
  rate: number;
  pricingLabel: string;
  description: string;
  hsnSac: string;
  unit: string;
}

export const PREDEFINED_SERVICES: ServicePackage[] = ${JSON.stringify(services, null, 2)};
`;

fs.writeFileSync('src/constants/services.ts', fileContent);
