import { Container, Typography, Paper, Box } from '@mui/material';

export default function InventoryPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Current Build & Inventory
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Inventory management coming soon...
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>
            This will show your current stadium build, items, and allow you to save/load
            configurations.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
