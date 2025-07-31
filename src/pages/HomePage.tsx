import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Build, Inventory } from '@mui/icons-material';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Overwatch Stadium Optimizer
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Optimize your stadium builds for maximum efficiency
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Build sx={{ mr: 2 }} />
              <Typography variant="h5">Build Optimizer</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Create and optimize your stadium builds with our advanced algorithms
            </Typography>
            <Button component={Link} to="/optimizer" variant="contained" fullWidth>
              Start Optimizing
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Inventory sx={{ mr: 2 }} />
              <Typography variant="h5">Current Build</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              View and manage your current stadium build and inventory
            </Typography>
            <Button component={Link} to="/inventory" variant="outlined" fullWidth>
              View Build
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
