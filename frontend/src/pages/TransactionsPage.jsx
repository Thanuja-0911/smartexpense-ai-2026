import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { Badge } from '../components/UI/Badge';
import { EmptyState } from '../components/UI/EmptyState';
import { Skeleton } from '../components/UI/Skeleton';
import { ConfirmModal } from '../components/UI/ConfirmModal';
import { TransactionModal } from '../components/Transactions/TransactionModal';
import {
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';

try {
  applyPlugin(jsPDF);
} catch (e) { }

export const TransactionsPage = () => {
  const { formatCurrency } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receiptModalUrl, setReceiptModalUrl] = useState(null);

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        type: typeFilter,
        category: categoryFilter,
        sortBy,
        sortOrder,
      });

      const res = await api.get(`/transactions?${params.toString()}`);
      if (res.success) {
        setTransactions(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch transactions');
    } fontally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [search, typeFilter, categoryFilter, sortBy, sortOrder]);

  const handleSaveTransaction = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTx) {
        await api.put(`/transactions/${editingTx._id}`, formData);
        toast.success('Transaction updated!');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction created!');
      }
      setIsModalOpen(false);
      setEditingTx(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await api.delete(`/transactions/${deletingId}`);
      toast.success('Transaction deleted');
      setDeletingId(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return toast.info('No transactions to export');
    const headers = ['Date', 'Description', 'Category', 'Payment Method', 'Type', 'Amount'];
    const rows = transactions.map((t) => [
      new Date(t.date).toISOString().split('T')[0],
      `"${(t.description || t.category || '').replace(/"/g, '""')}"`,
      t.category,
      t.paymentMethod,
      t.type,
      t.amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartexpense_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    try {
      if (!transactions || transactions.length === 0) {
        return toast.info('No transactions to export');
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('SmartExpense-AI - Transaction History Report', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString('en-IN')} | Total Records: ${transactions.length}`,
        14,
        22
      );

      const tableColumn = ['Date', 'Description', 'Category', 'Payment', 'Type', 'Amount (INR)'];
      const tableRows = transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.description || t.category || '-',
        t.category || '-',
        t.paymentMethod || '-',
        t.type || '-',
        `${t.type === 'Expense' ? '-' : '+'} Rs. ${Number(t.amount || 0).toLocaleString('en-IN')}`,
      ]);

      const tableOptions = {
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [248, 250, 252],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
      };

      if (typeof autoTable === 'function') {
        autoTable(doc, tableOptions);
      } else if (typeof doc.autoTable === 'function') {
        doc.autoTable(tableOptions);
      } else {
        throw new Error('PDF generator plugin failed to initialize');
      }

      doc.save(`smartexpense_transactions_${Date.now()}.pdf`);
      toast.success('Transaction history PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast.error(`Failed to export PDF: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Transaction Management</h2>
          <p className="text-xs text-slate-400">Search, filter, and audit your transaction history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportCSV} variant="outline" size="sm" icon={FileSpreadsheet}>
            Export CSV
          </Button>
          <Button onClick={exportPDF} variant="outline" size="sm" icon={FileText}>
            Export PDF
          </Button>
          <Button
            onClick={() => {
              setEditingTx(null);
              setIsModalOpen(true);
            }}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <Input
            placeholder="Search description..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Types (Income & Expense)' },
              { value: 'Income', label: 'Income Only' },
              { value: 'Expense', label: 'Expense Only' },
            ]}
          />

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Salary', label: 'Salary' },
              { value: 'Food', label: 'Food & Dining' },
              { value: 'Transport', label: 'Transport & Fuel' },
              { value: 'Shopping', label: 'Shopping' },
              { value: 'Bills', label: 'Bills' },
              { value: 'Rent', label: 'Rent' },
              { value: 'Subscriptions', label: 'Subscriptions' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          {/* Sorting */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
            options={[
              { value: 'date-desc', label: 'Date: Newest First' },
              { value: 'date-asc', label: 'Date: Oldest First' },
              { value: 'amount-desc', label: 'Amount: High to Low' },
              { value: 'amount-asc', label: 'Amount: Low to High' },
            ]}
          />
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description="Start tracking your spending by adding your first transaction."
            actionText="Add Transaction"
            onAction={() => {
              setEditingTx(null);
              setIsModalOpen(true);
            }}
            className="border-none py-16"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold">Description</th>
                  <th className="py-3.5 px-6 font-semibold">Category</th>
                  <th className="py-3.5 px-6 font-semibold">Payment</th>
                  <th className="py-3.5 px-6 font-semibold">Type</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-slate-100 font-medium">{tx.description || tx.category || '-'}</td>
                    <td className="py-4 px-6">
                      <Badge variant="neutral">{tx.category}</Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{tx.paymentMethod}</td>
                    <td className="py-4 px-6">
                      <Badge variant={tx.type === 'Income' ? 'income' : 'expense'}>{tx.type}</Badge>
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-extrabold ${tx.type === 'Income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                    >
                      {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} records)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchTransactions(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchTransactions(pagination.page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingTx}
        loading={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction record?"
        loading={submitting}
      />
    </div>
  );
};
