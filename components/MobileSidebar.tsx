"use client"
import { useAuth } from "@/contexts/AuthContext";
import { Box, CircularProgress, Drawer, IconButton, Link, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Menu as HamburgerMenu } from "lucide-react";
import { useState } from "react";
export default function MobileSidebar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    const handleOpenMobileMenu = () => {
        setMobileMenuOpen(true);
    };

    const handleCloseMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
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
                >
                    <Box
                        sx={{ width: 250 }}
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

                            {isLoading ? (
                                <ListItem>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        <CircularProgress size={24} thickness={4} />
                                    </Box>
                                </ListItem>
                            ) : user ? (
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
        </>
    )
}
