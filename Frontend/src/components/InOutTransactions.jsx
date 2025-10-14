import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Divider,
  Snackbar,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

// API service for transactions
const API_BASE_URL = "http://localhost:5000/api";

const typeOptions = ["Income", "Expense"];
const categoryOptions = [
  "Salary",
  "Project Revenue",
  "Operations",
  "Equipment",
  "Service Revenue",
  "Marketing",
  "Product Revenue",
];

const InOutTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "",
    category: "",
    remarks: "",
    attachment: null,
  });
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [totals, setTotals] = useState({
    income: 0,
    expenses: 0,
    net: 0
  });

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('category', filterCategory);
      if (search) params.append('search', search);

      const response = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      setTotals(data.totals || { income: 0, expenses: 0, net: 0 });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setErrorMessage('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount and when filters change
  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory, search]);

  // Open detail view modal
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  // Close detail view modal
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  // Download attachment
  const handleDownloadAttachment = async (transactionId, fileName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/attachment`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setErrorMessage('Failed to download attachment');
    }
  };

  // Add new transaction
  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.type || !newTransaction.category) {
      setErrorMessage("Please fill in all required fields: Description, Amount, Type, and Category");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('description', newTransaction.description);
      formData.append('amount', newTransaction.amount);
      formData.append('type', newTransaction.type);
      formData.append('category', newTransaction.category);
      formData.append('remarks', newTransaction.remarks);
      
      if (newTransaction.attachment) {
        formData.append('attachment', newTransaction.attachment);
      }

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      const result = await response.json();
      
      setSuccessMessage("Transaction added successfully!");
      setNewTransaction({ 
        description: "", 
        amount: "", 
        type: "", 
        category: "", 
        remarks: "",
        attachment: null 
      });
      setOpen(false);
      
      // Refresh the transactions list
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      setErrorMessage('Failed to add transaction');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete transaction');
        }

        setSuccessMessage('Transaction deleted successfully');
        fetchTransactions(); // Refresh the list
      } catch (error) {
        console.error('Error deleting transaction:', error);
        setErrorMessage('Failed to delete transaction');
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xlsx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setErrorMessage('Please select a valid file type: PDF, JPG, PNG, DOC, DOCX, XLSX');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must be less than 5MB');
        return;
      }

      setNewTransaction({
        ...newTransaction,
        attachment: file
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Track all income and expense transactions with receipts
      </Typography>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Summary Cards */}
      <Box sx={{ display: "flex", gap: 3, mb: 3, justifyContent: "center" }}>
        <Box sx={{ backgroundColor: "#e6f4ea", p: 2, borderRadius: 2, flex: 1, display: "flex", alignItems: "center", gap: 2, minWidth: 180 }}>
          <ArrowUpwardIcon sx={{ color: "#34a853", fontSize: 32 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Total Income</Typography>
            <Typography variant="h6" sx={{ color: "#188038", fontWeight: "bold" }}>₹{totals.income.toLocaleString()}</Typography>
          </Box>
        </Box>
        
        <Box sx={{ backgroundColor: "#fdecea", p: 2, borderRadius: 2, flex: 1, display: "flex", alignItems: "center", gap: 2, minWidth: 180 }}>
          <ArrowDownwardIcon sx={{ color: "#d93025", fontSize: 32 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Total Expenses</Typography>
            <Typography variant="h6" sx={{ color: "#d93025", fontWeight: "bold" }}>₹{totals.expenses.toLocaleString()}</Typography>
          </Box>
        </Box>
        
        <Box sx={{ backgroundColor: "#e8f0fe", p: 2, borderRadius: 2, flex: 1, display: "flex", alignItems: "center", gap: 2, minWidth: 180 }}>
          <CalendarTodayIcon sx={{ color: "#1a73e8", fontSize: 32 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Net Income</Typography>
            <Typography variant="h6" sx={{ color: totals.net >= 0 ? "#188038" : "#d93025", fontWeight: "bold" }}>
              ₹{totals.net.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Filters and Add Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Transaction History ({transactions.length} records)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Transaction
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          fullWidth
          size="small"
          label="Search transactions or remarks"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 2, minWidth: "200px" }}
        />
        <TextField
          select
          fullWidth
          size="small"
          label="Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ flex: 1, minWidth: "160px" }}
        >
          <MenuItem value="">All Types</MenuItem>
          {typeOptions.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          sx={{ flex: 1, minWidth: "180px" }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categoryOptions.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table with Clickable Rows */}
      <Paper elevation={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((t) => (
                <TableRow 
                  key={t._id} 
                  hover 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                  onClick={() => handleViewDetails(t)}
                >
                  <TableCell>{formatDate(t.date)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {t.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={t.category} 
                      size="small" 
                      color={t.type === "Income" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell style={{ 
                    color: t.type === "Income" ? "green" : "red",
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {t.type === "Income" ? "" : ""}₹{t.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {t.remarks ? (
                      <Tooltip title={t.remarks} arrow placement="top-start">
                        <Typography variant="body2" sx={{ 
                          maxWidth: 150, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {t.remarks}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="textSecondary" fontStyle="italic">
                        No remarks
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {t.attachment ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="File Attachment" arrow>
                          <InsertDriveFileIcon fontSize="small" color="primary" />
                        </Tooltip>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.attachment.originalName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" fontStyle="italic">
                        No file
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.type}
                      color={t.type === "Income" ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details" arrow>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(t);
                        }}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Transaction" arrow>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransaction(t._id);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add Transaction Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon />
            Add New Transaction
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Description *"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Amount *"
            type="number"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            fullWidth
            required
            InputProps={{ startAdornment: '₹' }}
          />
          <TextField
            select
            label="Type *"
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
            fullWidth
            required
          >
            {typeOptions.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Category *"
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            fullWidth
            required
          >
            {categoryOptions.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Remarks"
            value={newTransaction.remarks}
            onChange={(e) => setNewTransaction({ ...newTransaction, remarks: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Add any additional notes, comments, or details about this transaction..."
          />
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Attach Receipt (Optional)
            </Typography>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="attachment-upload"
            />
            <label htmlFor="attachment-upload">
              <Button 
                variant="outlined" 
                component="span" 
                startIcon={<AttachFileIcon />}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                {newTransaction.attachment ? `📎 ${newTransaction.attachment.name}` : 'Choose file (PDF, Image, Document)'}
              </Button>
            </label>
            {newTransaction.attachment && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                ✅ File selected: {newTransaction.attachment.name}
              </Typography>
            )}
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Max file size: 5MB • Supported: PDF, JPG, PNG, DOC, XLSX
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddTransaction}
            disabled={!newTransaction.description || !newTransaction.amount || !newTransaction.type || !newTransaction.category}
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Detail View Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={handleCloseDetailModal} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" />
              Transaction Details
            </Typography>
            <IconButton onClick={handleCloseDetailModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 1 }}>
            Read Only - No editing allowed
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedTransaction && (
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                  {/* Left Column */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(selectedTransaction.date)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedTransaction.description}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Category
                      </Typography>
                      <Chip 
                        label={selectedTransaction.category} 
                        color={selectedTransaction.type === "Income" ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Type
                      </Typography>
                      <Chip
                        label={selectedTransaction.type}
                        color={selectedTransaction.type === "Income" ? "success" : "error"}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Right Column */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Amount
                      </Typography>
                      <Typography 
                        variant="h5" 
                        fontWeight="bold"
                        color={selectedTransaction.type === "Income" ? "success.main" : "error.main"}
                      >
                        {selectedTransaction.type === "Income" ? "" : ""}₹{selectedTransaction.amount.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Attachment
                      </Typography>
                      {selectedTransaction.attachment ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachFileIcon fontSize="small" color="primary" />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {selectedTransaction.attachment.originalName}
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadAttachment(selectedTransaction._id, selectedTransaction.attachment.originalName)}
                            size="small"
                          >
                            Download
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          No attachment
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Remarks Section */}
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Remarks
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'grey.50',
                      minHeight: 80
                    }}
                  >
                    <Typography variant="body2">
                      {selectedTransaction.remarks || "No remarks provided"}
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            variant="contained" 
            onClick={handleCloseDetailModal}
            fullWidth
            size="large"
          >
            Close Details
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InOutTransactions;