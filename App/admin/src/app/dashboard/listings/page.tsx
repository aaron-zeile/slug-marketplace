'use client';

import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';

interface AdminItemSeller {
  id: string;
  name: string;
}

interface AdminItem {
  id: string;
  name: string;
  seller: AdminItemSeller;
  price: number;
  status: string;
  createdAt: string;
}

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch('/admin/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export default function ListingsPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.seller.name.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await gql(`
          query {
            adminItems {
              id name price status createdAt
              seller { id name }
            }
          }
        `);
        setItems(data.adminItems);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete listing "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await gql(`mutation($id: String!) { adminDeleteItem(id: $id) }`, { id });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        p: 4,
        border: '1px solid #e5e7eb',
        bgcolor: '#fff',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <ListAltIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Listings
        </Typography>
        {!loading && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({items.length})
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loading && items.length > 0 && (
        <TextField
          fullWidth
          size="small"
          placeholder="Search by listing name or seller"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">No listings found.</Typography>
      ) : filteredItems.length === 0 ? (
        <Typography color="text.secondary">
          No listings match &ldquo;{searchQuery}&rdquo;.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Seller</strong>
                </TableCell>
                <TableCell>
                  <strong>Price</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Created</strong>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.seller.name}</TableCell>
                  <TableCell>${Number(item.price).toFixed(2)}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      {deletingId === item.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
