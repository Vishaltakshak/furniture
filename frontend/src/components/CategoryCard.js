import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/products/${category.id}`}
      className="category-card group block"
      data-testid={`category-card-${category.id}`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-8">
        <h3 className="font-heading text-2xl md:text-3xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        <div className="flex items-center gap-2 text-white/70 group-hover:text-primary transition-colors">
          <span className="text-sm tracking-wider uppercase">Explore</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
        </div>
      </div>

      {/* Gold border on hover */}
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/50 transition-colors z-20 pointer-events-none" />
    </Link>
  );
};

export default CategoryCard;
