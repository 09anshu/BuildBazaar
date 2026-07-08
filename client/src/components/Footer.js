import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Mail, Award, Zap, Banknote, Landmark } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-amazon_blue text-white mt-10">
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="bg-amazon_blue-light p-4 text-center text-xs hover:bg-gray-700 cursor-pointer font-bold"
      >
        Back to top
      </div>

      <div className="border-b border-white/10 bg-slate-950/25">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <div className="rounded-2xl bg-[#2a3241] p-6 md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-amazon_yellow mb-2">Newsletter</p>
                <h3 className="text-3xl font-bold text-white">Get project deals, rental offers,<br className="hidden sm:block"/>and delivery updates</h3>
                <p className="mt-4 text-sm text-gray-300">Subscribe for new stock alerts, seasonal discounts, and<br className="hidden sm:block"/>site-ready product recommendations.</p>
              </div>

              <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="newsletter-email">Email</label>
                <div className="flex flex-1 items-center rounded-lg bg-white px-4 text-slate-900">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <input
                    id="newsletter-email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
                <button type="submit" className="rounded-lg bg-amazon_yellow px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-yellow-500">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-10 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold mb-4">Get to Know Us</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li><Link to="/info/about" className="hover:underline hover:text-[#f5a623] transition-colors">About BuildBazaar</Link></li>
            <li><Link to="/info/careers" className="hover:underline hover:text-[#f5a623] transition-colors">Careers</Link></li>
            <li><Link to="/info/press" className="hover:underline hover:text-[#f5a623] transition-colors">Press Releases</Link></li>
            <li><Link to="/info/impact" className="hover:underline hover:text-[#f5a623] transition-colors">Environmental Impact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Connect with Us</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#f5a623] transition-colors">Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#f5a623] transition-colors">Twitter</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#f5a623] transition-colors">Instagram</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Make Money with Us</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li><Link to="/register" className="hover:underline hover:text-[#f5a623] transition-colors">Sell on BuildBazaar</Link></li>
            <li><Link to="/info/seller-guide" className="hover:underline hover:text-[#f5a623] transition-colors">Seller Central</Link></li>
            <li><Link to="/info/affiliate" className="hover:underline hover:text-[#f5a623] transition-colors">Become an Affiliate</Link></li>
            <li><Link to="/info/advertise" className="hover:underline hover:text-[#f5a623] transition-colors">Advertise Your Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Let Us Help You</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li><Link to="/profile" className="hover:underline hover:text-[#f5a623] transition-colors">Your Account</Link></li>
            <li><Link to="/myorders" className="hover:underline hover:text-[#f5a623] transition-colors">Your Orders</Link></li>
            <li><Link to="/info/shipping-rates" className="hover:underline hover:text-[#f5a623] transition-colors">Shipping Rates & Policies</Link></li>
            <li><Link to="/info/help" className="hover:underline hover:text-[#f5a623] transition-colors">Help & Support</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 py-8">
        <div className="max-w-screen-xl mx-auto px-10 text-center">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              SSL Secure
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              ISO Certified
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              UPI
            </span>
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cards
            </span>
            <span className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              COD
            </span>
            <span className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Finance
            </span>
          </div>

          <Link to="/" className="text-2xl font-bold text-amazon_yellow mb-6 inline-block">
            Build<span className="text-white">Bazaar</span>
          </Link>
          <p className="text-xs text-gray-400">
            &copy; 2026 BuildBazaar, Inc. All rights reserved.
            The construction material and equipment marketplace.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
