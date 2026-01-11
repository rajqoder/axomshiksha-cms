'use client';

import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const UserProfileDropdown = () => {
    const { signOut, user, isLoading } = useAuth();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
        handleCloseUserMenu();
    };

    // Prevent hydration mismatch by showing loading state until mounted
    // Match the width of the user profile avatar to prevent layout shift
    if (!mounted || isLoading) {
        return <CircularProgress size={32} thickness={4} />
    }

    if (!user) {
        return (
            <>
                <Button color="primary" component={Link} href="/login">
                    Login
                </Button>
                <Button color="primary" component={Link} href="/signup">
                    Sign Up
                </Button>
            </>
        );
    }

    return (
        <>
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
                    disableScrollLock
                >
                    <MenuItem onClick={handleCloseUserMenu} component={Link} href="/profile">
                        <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleSignOut}>
                        <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                </Menu>
            </Box>
        </>
    );
};

export default UserProfileDropdown;