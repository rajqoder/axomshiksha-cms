'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, BookOpen, Layers, Settings, Users } from 'lucide-react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, useTheme } from '@mui/material';

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'New Post', href: '/admin/posts/new', icon: FileText },
    { name: 'Syllabus', href: '/admin/syllabus', icon: BookOpen },
    { name: 'Metadata', href: '/admin/metadata', icon: Layers },
    { name: 'Authors', href: '/admin/authors', icon: Users },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const theme = useTheme();

    return (
        <Paper
            component="aside"
            elevation={0}
            square
            sx={{
                width: 256,
                bgcolor: 'background.paper',
                borderRight: 1,
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                py: 2
            }}
        >
            <List component="nav" disablePadding>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                selected={isActive}
                                sx={{
                                    mx: 1,
                                    borderRadius: 1,
                                    '&.Mui-selected': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                                        color: theme.palette.primary.contrastText,
                                        '&:hover': {
                                            bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.main',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: theme.palette.primary.contrastText,
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'inherit' : 'text.secondary' }}>
                                    <item.icon size={20} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: isActive ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
}
