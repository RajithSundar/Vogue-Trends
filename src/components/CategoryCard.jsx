import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ id, tag, title, subtitle, imageUrl }) {
  return (
    <Link
      key={id}
      to={`/shop/${encodeURIComponent(tag)}`}
      className="block border border-stone-200/50 bg-white rounded-2xl premium-shadow flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
    >
      <div className="h-56 w-full bg-stone-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6 text-center space-y-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-2xl font-serif font-bold text-editorial-ink">{title}</h3>
          <p className="text-stone-500 text-sm mt-1">{subtitle}</p>
        </div>
        <span className="inline-block bg-editorial-ink text-white px-6 py-3 rounded-full w-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors text-center">
          Shop Now
        </span>
      </div>
    </Link>
  );
}