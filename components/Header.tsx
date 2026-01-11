import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Image from 'next/image';
import UserProfileDropdown from './UserProfileDropdown';
import MobileMenu from './MobileMenu';
import { Suspense } from 'react';
import { CircularProgress } from '@mui/material';
import { createClient } from '@/lib/supabase/server';

const Header = async () => {

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'background.default', zIndex: 1201 }}>
      <Toolbar>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/logo.png"
            alt="AxomShiksha Logo"
            width={40}
            height={40}
            style={{ borderRadius: '4px' }}
          />
        </Link>

        {/* Desktop Navigation - Server rendered */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, ml: 'auto' }}>
          <Link href="/posts" style={{ textDecoration: 'none' }}>
            <Typography variant="body1" sx={{ color: '#3b82f6', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              Posts
            </Typography>
          </Link>
          <Link href="/new-post" style={{ textDecoration: 'none' }}>
            <Typography variant="body1" sx={{ color: '#3b82f6', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
              New Post
            </Typography>
          </Link>

          <Suspense fallback={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
            <CircularProgress size={24} thickness={4} />
          </Box>
        }>
            <UserProfileDropdownWrapper />
          </Suspense>
        </Box>

        {/* Mobile Navigation - Client Component */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, ml: 'auto' }}>
          <MobileMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

const UserProfileDropdownWrapper = async () => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return <UserProfileDropdown user={session?.user} isLoading={!session && session !== undefined} />;
}