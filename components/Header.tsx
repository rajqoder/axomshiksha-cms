'use client';

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Image from 'next/image'; // Add Image import
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, signOut, isLoading } = useAuth();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleCloseUserMenu();
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'background.default', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <Button color="primary" component={Link} href="/posts">
            Posts
          </Button>
          <Button color="primary" component={Link} href="/new-post">
            New Post
          </Button>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
              <CircularProgress size={24} thickness={4} />
            </Box>
          ) : user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={user.user_metadata?.display_name || user.email || 'Profile'}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', color: 'white' }}>
                    {(user.user_metadata?.display_name || user.email)?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={handleCloseUserMenu} component={Link} href="/profile">
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <>
              <Button color="primary" component={Link} href="/login">
                Login
              </Button>
              <Button color="primary" component={Link} href="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;