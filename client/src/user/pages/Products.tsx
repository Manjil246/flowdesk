import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { products, categories } from '@/user/data/products';
import ProductCard from '@/user/components/ProductCard';
import Navbar from '@/user/components/Navbar';
import Footer from '@/user/components/Footer';
import AnnouncementBar from '@/user/components/AnnouncementBar';
import { SlidersHorizontal, X, Grid3X3, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Rating' },
];

const colorSwatches = [
  { name: 'Black', hex: '#111111' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Navy', hex: '#000080' },
  { name: 'Maroon', hex: '#800000' }, { name: 'Cream', hex: '#FFFDD0' }, { name: 'Gold', hex: '#FFD700' },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState(4);

  const selectedCategory = params.get('category') || '';
  const sort = params.get('sort') || 'featured';

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) {
      result = result.filter(p => {
        const cat = categories.find(c => c.slug === selectedCategory);
        return cat && p.categoryId === cat.id;
      });
    }
    switch (sort) {
      case 'price_asc': result.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'price_desc': result.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.reverse(); break;
    }
    return result;
  }, [selectedCategory, sort]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(params);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setParams(newParams);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl lg:text-5xl font-normal text-foreground mb-2">
              {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Products' : 'All Products'}
            </h1>
            <p className="font-body text-sm text-muted-foreground">Showing {filtered.length} products</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[1.5px]">
              <SlidersHorizontal size={14} /> Filters
            </button>

            {/* Category pills */}
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={() => updateParam('category', '')} className={`px-3 py-1.5 rounded-sm font-body text-[11px] uppercase tracking-[1px] transition-colors ${!selectedCategory ? 'bg-foreground text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat.slug} onClick={() => updateParam('category', cat.slug)} className={`px-3 py-1.5 rounded-sm font-body text-[11px] uppercase tracking-[1px] transition-colors ${selectedCategory === cat.slug ? 'bg-foreground text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}>
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="font-body text-xs bg-transparent border border-border rounded-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="font-display text-2xl text-foreground mb-3">No products found</h3>
              <p className="font-body text-sm text-muted-foreground mb-6">Try adjusting your filters</p>
              <button onClick={() => setParams({})} className="bg-foreground text-primary-foreground px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[1.5px] rounded-sm">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}


