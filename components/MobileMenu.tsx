'use client';

import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { Menu as HamburgerMenu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const MobileMenu = () => {
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleOpenMobileMenu = () => {
    setMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    handleCloseMobileMenu();
  };

  useEffect(() => {
    if (isDesktop && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isDesktop, mobileMenuOpen]);

  return (
    <Box sx={{ ml: 'auto' }}>
      <IconButton
        edge="end"
        color="inherit"
        aria-label="menu"
        onClick={handleOpenMobileMenu}
        sx={{ mr: 2 }}
      >
        <HamburgerMenu />
      </IconButton>
      
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleCloseMobileMenu}
        sx={{ zIndex: (t) => t.zIndex.appBar + 1 }}
      >
        <Box
          sx={{ width: 250, pt: { xs: 7, sm: 8 } }}
          role="presentation"
          onClick={handleCloseMobileMenu}
          onKeyDown={handleCloseMobileMenu}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/posts">
                <ListItemText primary="Posts" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/new-post">
                <ListItemText primary="New Post" />
              </ListItemButton>
            </ListItem>
            {user ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/profile">
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleSignOut}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/login">
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={Link} href="/signup">
                    <ListItemText primary="Sign Up" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MobileMenu;