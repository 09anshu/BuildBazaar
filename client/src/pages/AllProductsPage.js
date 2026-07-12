import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import getImageUrl from '../utils/getImageUrl';
import {
  Search,
  Filter,
  X,
  Grid,
  List as ListIcon,
  MapPin,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ShoppingCart,
  Star,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { label: 'Cement', icon: '🧱' },
  { label: 'Steel', icon: '🔩' },
  { label: 'Tools', icon: '🔧' },
  { label: 'Machinery', icon: '🚜' },
  { label: 'Safety', icon: '🦺' },
  { label: 'Electrical', icon: '⚡' },
  { label: 'Plumbing', icon: '🔧' },
  { label: 'Paint', icon: '🎨' },
];

const ALL_MATERIAL_TYPES = {
  Cement: [
    { label: 'OPC Cement', icon: '🧱' },
    { label: 'PPC Cement', icon: '🧱' },
    { label: 'White Cement', icon: '🧱' },
    { label: 'Waterproof', icon: '💧' },
  ],
  Steel: [
    { label: 'Rebar', icon: '🔩' },
    { label: 'I-Beam', icon: '🏗️' },
    { label: 'Wire', icon: '🔗' },
    { label: 'Angle', icon: '📐' },
  ],
  Tools: [
    { label: 'Drill', icon: '🪛' },
    { label: 'Saw', icon: '🪚' },
    { label: 'Hammer', icon: '🔨' },
    { label: 'Measurement', icon: '📏' },
  ],
  Machinery: [
    { label: 'Mixer', icon: '🔄' },
    { label: 'Excavator', icon: '🚜' },
    { label: 'Compactor', icon: '🔨' },
    { label: 'Hoist', icon: '🏗️' },
  ],
  Safety: [
    { label: 'Helmet', icon: '⛑️' },
    { label: 'Gloves', icon: '🧤' },
    { label: 'Shoes', icon: '🥾' },
    { label: 'Mask', icon: '😷' },
    { label: 'Vest', icon: '🦺' },
  ],
  Electrical: [
    { label: 'Wire', icon: '⚡' },
    { label: 'MCB', icon: '🎛️' },
    { label: 'Pipe', icon: '🔌' },
    { label: 'Light', icon: '💡' },
  ],
  Plumbing: [
    { label: 'CPVC', icon: '🚰' },
    { label: 'PVC', icon: '💧' },
    { label: 'Pump', icon: '⚙️' },
    { label: 'Fittings', icon: '🔧' },
  ],
  Paint: [
    { label: 'Emulsion', icon: '🎨' },
    { label: 'Primer', icon: '🖌️' },
    { label: 'Waterproof', icon: '💧' },
  ],
};

const SORT_OPTIONS = [
  { label: 'Popular Now', value: 'popular' },
  { label: 'Cheapest First', value: 'price_asc' },
  { label: 'Newest Arrivals', value: 'newest' },
];

const AllProductsPage = () => {
  const { category: urlCategory } = useParams();
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState(urlCategory ? [urlCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category filter when navigating between navbar tabs
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategories([urlCategory]);
    } else {
      setSelectedCategories([]);
    }
    // Reset other filters when switching categories via navbar
    setSelectedBrands([]);
    setSelectedTypes([]);
    setPriceRange([0, 100000]);
    setInStockOnly(false);
    setSortBy('popular');
  }, [urlCategory]);

  useEffect(() => {
    dispatch(listProducts({ keyword: '', pageNumber: '', category: '', pageSize: 100 }));
  }, [dispatch]);

  // Compute available filters based on selected category
  const availableBrands = useMemo(() => {
    let baseProducts = products;
    if (urlCategory) {
      baseProducts = baseProducts.filter(p => p.category === urlCategory);
    }
    return Array.from(new Set(baseProducts.map((p) => p.brand))).sort();
  }, [products, urlCategory]);

  const availableTypes = useMemo(() => {
    if (urlCategory && ALL_MATERIAL_TYPES[urlCategory]) {
      return ALL_MATERIAL_TYPES[urlCategory];
    }
    // If no category or unknown category, show a mixed sample
    return [
      { label: 'Cement', icon: '🧱' },
      { label: 'Steel Rebar', icon: '🔩' },
      { label: 'Tools', icon: '🔨' },
      { label: 'Machinery', icon: '🚜' },
      { label: 'Safety', icon: '🦺' },
    ];
  }, [urlCategory]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    if (selectedTypes.length > 0) {
      result = result.filter((p) =>
        selectedTypes.some(
          (t) =>
            p.category.toLowerCase().includes(t.toLowerCase()) ||
            p.name.toLowerCase().includes(t.toLowerCase())
        )
      );
    }

    if (inStockOnly) {
      result = result.filter((p) => p.countInStock > 0);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'newest':
        result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case 'popular':
      default:
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [products, selectedCategories, selectedBrands, selectedTypes, inStockOnly, priceRange, sortBy]);

  const addToCartHandler = (product) => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        basePrice: product.price,
        wholesaleTiers: product.wholesaleTiers,
        countInStock: product.countInStock,
        qty: 1,
      })
    );
    toast.success(`${product.name} added to cart!`);
  };

  const selectedSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Popular Now';

  const FilterSidebar = ({ onClose }) => (
    <div className="space-y-6">
      {/* Header for mobile */}
      {onClose && (
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" /> Filters
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Desktop header */}
      {!onClose && (
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" /> FILTERS
        </h2>
      )}

      {/* Category - Only show if we are NOT in a specific category route */}
      {!urlCategory && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Category</h3>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => toggleCategory(cat.label)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                  selectedCategories.includes(cat.label)
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand */}
      {availableBrands.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Brand</h3>
          <div className="flex flex-wrap gap-2">
            {availableBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => toggleBrand(brand)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                  selectedBrands.includes(brand)
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub Types / Material Types */}
      {availableTypes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            {urlCategory === 'Tools' || urlCategory === 'Machinery' ? 'Equipment Type' : 'Material Type'}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {availableTypes.map((mat) => (
              <button
                key={mat.label}
                onClick={() => toggleType(mat.label)}
                className={`flex flex-col items-center justify-center text-center gap-1 rounded-xl border p-2 text-xs font-semibold transition-all ${
                  selectedTypes.includes(mat.label)
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{mat.icon}</span>
                <span className="leading-tight">{mat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Price Range</h3>
        <input
          type="range"
          min="0"
          max="100000"
          step="500"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([0, Number(e.target.value)])}
          className="w-full accent-amber-500"
        />
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>₹0</span>
          <span className="font-semibold text-gray-900">
            ₹{priceRange[1].toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-amber-500"
          />
          <span className="text-sm text-gray-700">In Stock</span>
        </label>
      </div>

      {/* Clear All */}
      {(selectedCategories.length > 0 ||
        selectedBrands.length > 0 ||
        selectedTypes.length > 0 ||
        inStockOnly ||
        priceRange[1] < 100000) && (
        <button
          onClick={() => {
            setSelectedCategories([]);
            setSelectedBrands([]);
            setSelectedTypes([]);
            setInStockOnly(false);
            setPriceRange([0, 100000]);
          }}
          className="w-full rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      {urlCategory && (
        <div className="bg-gradient-to-r from-[#0f1117] to-[#181b24] px-4 py-6">
          <div className="max-w-screen-2xl mx-auto">
            <p className="text-sm text-white/50 mb-1">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              {' / '}
              <Link to="/all-products" className="hover:text-white transition-colors">All Products</Link>
              {' / '}
              <span className="text-[#f5a623]">{urlCategory}</span>
            </p>
            <h1 className="text-3xl font-black text-white">
              {urlCategory}
            </h1>
            <p className="text-sm text-white/60 mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-bold text-gray-900">
              1-{Math.min(24, filteredProducts.length)}
            </span>{' '}
            of{' '}
            <span className="font-bold text-gray-900">
              {filteredProducts.length}
            </span>{' '}
            results
          </p>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-amber-400"
              >
                Sort By:{' '}
                <span className="text-amber-700">{selectedSortLabel}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 top-full z-40 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                        sortBy === option.value
                          ? 'bg-amber-50 font-bold text-amber-800'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto flex gap-6 px-4 py-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6">
              <FilterSidebar onClose={() => setIsMobileFilterOpen(false)} />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-lg font-semibold text-gray-900">
                No products found
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <Link
                    to={`/product/${product._id}`}
                    className="relative block h-52 overflow-hidden bg-gray-50"
                  >
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-4">
                    <Link
                      to={`/product/${product._id}`}
                      className="mb-1 text-sm font-bold text-gray-900 line-clamp-2 hover:text-amber-700 transition-colors"
                    >
                      {product.name}
                    </Link>

                    {/* Rating */}
                    <div className="mb-2 flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-400">
                        ({product.numReviews})
                      </span>
                    </div>

                    {/* Price + Stock */}
                    <div className="mt-auto flex items-end justify-between">
                      <span className="text-xl font-black text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          product.countInStock > 0
                            ? 'text-emerald-600'
                            : 'text-red-500'
                        }`}
                      >
                        {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Quick Add */}
                    <button
                      onClick={() => addToCartHandler(product)}
                      disabled={product.countInStock === 0}
                      className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors ${
                        product.countInStock > 0
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                          : 'cursor-not-allowed bg-gray-200 text-gray-400'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Quick Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;
