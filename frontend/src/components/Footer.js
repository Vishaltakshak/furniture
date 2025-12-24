import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-2xl font-semibold gold-gradient-text mb-4">
              LUMIÈRE
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Crafting timeless luxury furniture for discerning homes since 1985.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6 text-foreground">
              Shop
            </h4>
            <ul className="space-y-3">
              {['Living Room', 'Bedroom', 'Office', 'Dining'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/products/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6 text-foreground">
              Support
            </h4>
            <ul className="space-y-3">
              {['Contact Us', 'FAQs', 'Shipping', 'Returns'].map((item) => (
                <li key={item}>
                  <span className="text-muted-foreground text-sm hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6 text-foreground">
              Newsletter
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-secondary/50 border border-border px-4 py-3 text-sm focus:border-primary outline-none"
                data-testid="footer-email-input"
              />
              <button className="bg-primary text-primary-foreground px-6 py-3 text-xs font-semibold tracking-wider uppercase hover:bg-accent transition-colors btn-press">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © 2024 Lumière Furniture. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map((item) => (
              <span key={item} className="text-muted-foreground text-xs hover:text-primary transition-colors cursor-pointer">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
