import type { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { Home, Build, Inventory } from '@mui/icons-material';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stadium Optimizer
          </Typography>

          <Box sx={{ display: 'flex' }}>
            <IconButton color={isActive('/') ? 'secondary' : 'inherit'} component={Link} to="/">
              <Home />
            </IconButton>
            <IconButton
              color={isActive('/optimizer') ? 'secondary' : 'inherit'}
              component={Link}
              to="/optimizer"
            >
              <Build />
            </IconButton>
            <IconButton
              color={isActive('/inventory') ? 'secondary' : 'inherit'}
              component={Link}
              to="/inventory"
            >
              <Inventory />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <main>{children}</main>
    </Box>
  );
}
