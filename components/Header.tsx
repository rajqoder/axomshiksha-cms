'use client';

import Link from 'next/link';
import Image from 'next/image';
import UserProfileDropdown from './UserProfileDropdown';
import MobileMenu from './MobileMenu';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="header-logo">
          <Image
            src="/logo.png"
            alt="AxomShiksha Logo"
            width={40}
            height={40}
            style={{ borderRadius: '4px' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav-desktop">
          <Link href="/posts" className="header-nav-link">
            Posts
          </Link>
          <UserProfileDropdown />
        </nav>

        {/* Mobile Navigation */}
        <div className="header-nav-mobile">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;