import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Users, Leaf, Newspaper, HelpCircle, Truck, BookOpen, Megaphone, Handshake, ArrowLeft } from 'lucide-react';

const pages = {
  about: {
    title: 'About BuildBazaar',
    icon: Building2,
    sections: [
      {
        heading: 'Who We Are',
        content: 'BuildBazaar is India\'s leading online marketplace for construction materials, tools, machinery, and safety equipment. We connect builders, contractors, and project managers with verified suppliers across the country — delivering quality products right to your construction site.'
      },
      {
        heading: 'Our Mission',
        content: 'To simplify procurement for the construction industry by providing a single platform where professionals can browse, compare, and order everything they need — from cement and steel to heavy machinery and safety gear — at competitive prices with reliable delivery.'
      },
      {
        heading: 'Why Choose Us',
        content: 'With a curated catalog of 10,000+ products, wholesale pricing tiers, dedicated account managers for bulk orders, and fast site delivery, BuildBazaar is built for the demands of real-world construction projects.'
      },
      {
        heading: 'Our Team',
        content: 'Our team includes construction industry veterans, supply chain experts, and technology professionals who understand the unique challenges of building procurement. We\'re backed by years of experience in both construction and e-commerce.'
      }
    ]
  },
  careers: {
    title: 'Careers at BuildBazaar',
    icon: Users,
    sections: [
      {
        heading: 'Join Our Team',
        content: 'We\'re building the future of construction commerce. If you\'re passionate about technology, logistics, or the construction industry, we\'d love to hear from you.'
      },
      {
        heading: 'Open Positions',
        content: '• Full Stack Developer (React + Node.js)\n• Supply Chain Manager\n• Business Development Executive\n• Customer Support Specialist\n• Logistics Coordinator\n• UI/UX Designer'
      },
      {
        heading: 'Benefits',
        content: '• Competitive salary & equity\n• Health insurance for you and your family\n• Flexible work arrangements\n• Learning & development budget\n• Team outings and events'
      },
      {
        heading: 'How to Apply',
        content: 'Send your resume and a brief cover letter to careers@buildbazaar.com. Mention the role you\'re applying for in the subject line. We review every application and aim to respond within 5 business days.'
      }
    ]
  },
  press: {
    title: 'Press Releases',
    icon: Newspaper,
    sections: [
      {
        heading: 'Latest News',
        content: 'Stay updated with the latest announcements, partnerships, and milestones from BuildBazaar.'
      },
      {
        heading: 'July 2026 — BuildBazaar Launches RBAC Dashboard System',
        content: 'BuildBazaar has rolled out a comprehensive role-based access control system with dedicated dashboards for Admin, Sales, and Customer Support teams — enabling efficient management of orders, enquiries, and promotions.'
      },
      {
        heading: 'June 2026 — Platform Launch',
        content: 'BuildBazaar officially launches as India\'s first dedicated construction materials e-commerce platform, featuring 50+ products across 8 categories with wholesale pricing and site delivery.'
      },
      {
        heading: 'Media Contact',
        content: 'For press inquiries, please contact press@buildbazaar.com'
      }
    ]
  },
  impact: {
    title: 'Environmental Impact',
    icon: Leaf,
    sections: [
      {
        heading: 'Our Commitment',
        content: 'At BuildBazaar, we believe in building a sustainable future. We are committed to reducing the environmental impact of construction procurement through smarter logistics, eco-friendly product sourcing, and waste reduction.'
      },
      {
        heading: 'Green Logistics',
        content: 'By consolidating orders and optimizing delivery routes, we reduce the number of trips to construction sites — cutting carbon emissions by an estimated 30% compared to traditional multi-vendor procurement.'
      },
      {
        heading: 'Eco-Friendly Products',
        content: 'We actively promote and highlight eco-friendly construction materials — including Portland Pozzolana Cement (PPC), recycled steel, non-toxic paints, and energy-efficient electrical equipment.'
      },
      {
        heading: 'Paperless Operations',
        content: 'Our platform is fully digital — from quotations and invoices to delivery confirmations. This eliminates thousands of pages of paper waste every month.'
      }
    ]
  },
  help: {
    title: 'Help & Support',
    icon: HelpCircle,
    sections: [
      {
        heading: 'Frequently Asked Questions',
        content: 'Q: How do I place an order?\nA: Browse products, add items to your cart, proceed to checkout, enter your shipping address, select payment method, and confirm your order.\n\nQ: Can I track my order?\nA: Yes! Go to "Your Orders" from your profile dropdown to see real-time status updates for all your orders.\n\nQ: How do I cancel or return an order?\nA: Contact our support team within 24 hours of placing the order for cancellation. For returns, reach out within 7 days of delivery.'
      },
      {
        heading: 'Contact Support',
        content: '• Email: support@buildbazaar.com\n• Phone: +91 1800-XXX-XXXX (toll-free)\n• Hours: Monday – Saturday, 9 AM – 6 PM IST\n• Live Chat: Available through the chatbot icon on every page'
      },
      {
        heading: 'Bulk Orders & Custom Quotes',
        content: 'For orders exceeding ₹5,00,000 or requiring custom specifications, our Sales team can provide personalized quotes. Contact sales@buildbazaar.com or use the "Request Quote" feature on any product page.'
      }
    ]
  },
  'shipping-rates': {
    title: 'Shipping Rates & Policies',
    icon: Truck,
    sections: [
      {
        heading: 'Delivery Zones',
        content: 'We currently deliver to all major cities and construction sites across India. Delivery availability and timelines depend on your pin code and product category.'
      },
      {
        heading: 'Shipping Rates',
        content: '• Orders above ₹10,000: FREE delivery\n• Standard delivery (3–7 business days): ₹199 – ₹499\n• Express delivery (1–3 business days): ₹499 – ₹999\n• Heavy machinery & bulk materials: Custom rates based on weight and distance'
      },
      {
        heading: 'Site Delivery',
        content: 'We offer direct-to-site delivery for construction materials. Our logistics partners are equipped to handle heavy loads and can deliver to active construction sites. Please ensure site access is available on the delivery date.'
      },
      {
        heading: 'Returns & Refunds',
        content: 'Damaged or defective products can be returned within 7 days of delivery. Refunds are processed within 5–7 business days after inspection. Bulk/custom orders are non-returnable unless defective.'
      }
    ]
  },
  'seller-guide': {
    title: 'Seller Central',
    icon: BookOpen,
    sections: [
      {
        heading: 'Start Selling on BuildBazaar',
        content: 'Join thousands of sellers on India\'s leading construction materials marketplace. List your products, reach new customers, and grow your business.'
      },
      {
        heading: 'How It Works',
        content: '1. Register as a Seller — Create your account and select the "Seller" role\n2. List Your Products — Add product details, images, pricing, and stock levels\n3. Receive Orders — Get notified when customers place orders\n4. Ship & Earn — Fulfill orders and receive payments directly to your account'
      },
      {
        heading: 'Seller Dashboard',
        content: 'Access your dedicated seller dashboard to manage products, track orders, view analytics, and handle customer communications — all in one place.'
      },
      {
        heading: 'Seller Support',
        content: 'Our dedicated seller support team is available at seller-support@buildbazaar.com to help with listing optimization, pricing strategy, and logistics setup.'
      }
    ]
  },
  advertise: {
    title: 'Advertise Your Products',
    icon: Megaphone,
    sections: [
      {
        heading: 'Boost Your Visibility',
        content: 'Promote your products to thousands of construction professionals actively looking for materials and equipment. Our advertising solutions help you stand out in search results and category pages.'
      },
      {
        heading: 'Advertising Options',
        content: '• Sponsored Products — Appear at the top of search results\n• Banner Ads — Featured placement on category and home pages\n• Deal of the Day — Showcase your best offers to all visitors\n• Email Campaigns — Reach our subscriber base with targeted promotions'
      },
      {
        heading: 'Pricing',
        content: 'Advertising packages start from ₹5,000/month. Contact our advertising team at ads@buildbazaar.com for a custom quote based on your goals and budget.'
      }
    ]
  },
  affiliate: {
    title: 'Become an Affiliate',
    icon: Handshake,
    sections: [
      {
        heading: 'Earn with BuildBazaar',
        content: 'Join our affiliate program and earn commission on every sale you refer. Perfect for construction bloggers, industry influencers, architects, and anyone with connections in the building industry.'
      },
      {
        heading: 'How It Works',
        content: '1. Sign up for our affiliate program\n2. Get your unique referral link\n3. Share with your audience\n4. Earn 3–8% commission on every completed sale'
      },
      {
        heading: 'Commission Structure',
        content: '• Construction Materials: 3% per sale\n• Tools & Safety Equipment: 5% per sale\n• Machinery & Rentals: 8% per sale\n• Minimum payout: ₹1,000'
      },
      {
        heading: 'Get Started',
        content: 'Email affiliates@buildbazaar.com with your website/social media details to apply. Approval takes 2–3 business days.'
      }
    ]
  }
};

const InfoPage = () => {
  const { slug } = useParams();
  const page = pages[slug];

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="bg-[#f5a623] text-black font-bold py-2 px-6 rounded-lg hover:bg-[#e79d1f] transition-colors">Go Home</Link>
      </div>
    );
  }

  const Icon = page.icon;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0f1117] text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-[#f5a623] mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#f5a623]/10 rounded-xl">
              <Icon className="h-8 w-8 text-[#f5a623]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{page.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-10">
          {page.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{section.heading}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
