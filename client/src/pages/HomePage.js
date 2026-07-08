import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../store/slices/productSlice';
import { fetchOffers } from '../store/slices/offerSlice';
import ProductCard from '../components/ProductCard';
import { ShieldCheck, Package, Truck, Wrench } from 'lucide-react';

const CategoryCard = ({ category }) => {
  const [imageError, setImageError] = useState(false);
  const CategoryIcon = category.icon;

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
          <p className="text-sm text-gray-500">{category.count}</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          Shop now
        </span>
      </div>

      <Link to={category.link} className="block overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        <div className="relative h-56 w-full overflow-hidden">
          {!imageError ? (
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${category.fallbackBg}`}>
              <CategoryIcon className="h-16 w-16 text-white/90" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      </Link>
    </div>
  );
};

const HomePage = () => {
  const { keyword, category: catParam } = useParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const { offers } = useSelector((state) => state.offers);

  useEffect(() => {
    dispatch(listProducts({ keyword, category: catParam }));
    dispatch(fetchOffers());
  }, [dispatch, keyword, catParam]);

  const activeOffers = offers?.filter(offer => offer.isActive) || [];

  const categories = [
    {
      name: 'Cement',
      count: '240+ items',
      image: 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=900&auto=format&fit=crop',
      link: '/category/Cement',
      icon: ShieldCheck,
      fallbackBg: 'from-stone-500 to-stone-700',
    },
    {
      name: 'Steel',
      count: '180+ items',
      image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?q=80&w=900&auto=format&fit=crop',
      link: '/category/Steel',
      icon: Package,
      fallbackBg: 'from-slate-600 to-slate-800',
    },
    {
      name: 'Tools',
      count: '420+ items',
      image: 'https://images.unsplash.com/photo-1581147036324-c17da42ef5e0?q=80&w=900&auto=format&fit=crop',
      link: '/category/Tools',
      icon: Wrench,
      fallbackBg: 'from-amber-600 to-orange-700',
    },
    {
      name: 'Machinery',
      count: '96+ items',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=900&auto=format&fit=crop',
      link: '/category/Machinery',
      icon: Truck,
      fallbackBg: 'from-blue-600 to-cyan-700',
    },
  ];

  const heroBadges = ['Fast site delivery', 'Quality certified', '24/7 support'];

  const featuredDeals = [
    {
      name: 'UltraBond OPC Cement',
      brand: 'UltraTech',
      unit: '50 kg bag',
      price: 365,
      originalPrice: 435,
      badge: '16% off',
      image: 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=800&auto=format&fit=crop',
      link: '/category/Cement',
    },
    {
      name: 'TMT Rebar 12 mm',
      brand: 'Tata Steel',
      unit: 'Per bundle',
      price: 17950,
      originalPrice: 20800,
      badge: '14% off',
      image: 'https://images.unsplash.com/photo-1516747773440-cf6f3d6f6c8e?q=80&w=800&auto=format&fit=crop',
      link: '/category/Steel',
    },
    {
      name: 'Site Drill Pro Kit',
      brand: 'Bosch',
      unit: '1 set',
      price: 8499,
      originalPrice: 9999,
      badge: 'In stock',
      image: 'https://images.unsplash.com/photo-1581147036324-c17da42ef5e0?q=80&w=800&auto=format&fit=crop',
      link: '/category/Tools',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/40">
      {/* Live Promo Offers Marquee */}
      {activeOffers.length > 0 && (
        <div className="bg-amber-400 py-2 relative z-30 overflow-hidden w-full">
          <div className="whitespace-nowrap animate-marquee flex items-center gap-10 text-slate-900 font-bold">
            {activeOffers.map((offer, index) => (
              <div key={`${offer._id}-${index}`} className="flex items-center gap-3 inline-flex">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  LIVE OFFER:
                </span>
                <span className="text-sm bg-white/50 px-3 py-1 rounded-full shadow-sm border border-amber-500/30">
                  {offer.title}
                </span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs shadow-sm">
                  Code: {offer.discountCode}
                </span>
              </div>
            ))}
            {/* Duplicate for seamless looping (optional depending on length, but safe to add) */}
            {activeOffers.map((offer, index) => (
              <div key={`dup-${offer._id}-${index}`} className="flex items-center gap-3 inline-flex">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  LIVE OFFER:
                </span>
                <span className="text-sm bg-white/50 px-3 py-1 rounded-full shadow-sm border border-amber-500/30">
                  {offer.title}
                </span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs shadow-sm">
                  Code: {offer.discountCode}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative h-[34rem] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop"
          alt="Construction site"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-slate-900/20" />

        <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-screen-2xl -translate-x-1/2 -translate-y-1/2 px-4">
          <div className="max-w-3xl text-white">
            <div className="mb-4 flex flex-wrap gap-3">
              {heroBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                  {badge}
                </span>
              ))}
            </div>
            <h1 className="mb-4 text-5xl font-black tracking-tight text-white sm:text-6xl">
              Build faster with materials, machinery, and site-ready support.
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-slate-200 sm:text-xl">
              Premium construction materials and equipment delivered to your site with dependable service for contractors and builders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/all-products" className="rounded-full bg-amber-400 px-8 py-3 font-bold text-slate-950 transition-colors hover:bg-amber-300">
                Shop All Materials
              </Link>
              <Link to="/category/Machinery" className="rounded-full border border-white/25 bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                Rent Machinery
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 mt-8 relative z-30">
        {/* Categories Grid */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>

        {/* Featured Products */}
        <div className="mb-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Featured deals</p>
              <h2 className="text-3xl font-black text-gray-900">Top offers for active project sites</h2>
            </div>
            <Link to="/category/Machinery" className="text-sm font-semibold text-blue-700 hover:underline">
              View all deals
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredDeals.map((product) => (
              <div key={product.name} className="group overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-52 overflow-hidden bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white ${product.badge.includes('off') ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                    {product.badge}
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">{product.brand}</p>
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.unit}</p>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-2xl font-black text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="pb-1 text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link to={product.link} className="text-sm font-semibold text-blue-700 hover:underline">
                      See details
                    </Link>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Site ready
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading ? null : error ? null : products.length > 0 ? (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-xl font-bold text-gray-900">More from the catalog</h3>
              <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto">
                {products.slice(0, 4).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Large Banner Ad */}
        <div className="w-full h-48 bg-blue-100 rounded-md mb-10 overflow-hidden flex items-center justify-between px-10">
          <div className="max-w-md">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Heavy Machinery Rental</h3>
            <p className="text-blue-800">Excavators, Cranes, and Bulldozers available for daily, weekly, and monthly rent.</p>
          </div>
          <Link to="/category/Machinery" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
            Learn More
          </Link>
        </div>

        {/* More Products */}
        <div className="bg-white p-6 shadow-md mb-10">
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
          <div className="grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto">
            {products.slice(4, 12).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
