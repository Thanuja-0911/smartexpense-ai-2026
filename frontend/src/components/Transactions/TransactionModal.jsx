import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { DatePicker } from '../UI/DatePicker';
import { Upload, DollarSign, FileText, Calendar, Tag, CreditCard } from 'lucide-react';

export const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: 'Expense',
      amount: '',
      category: 'Food',
      paymentMethod: 'UPI',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');
  const selectedDate = watch('date');

  useEffect(() => {
    register('date', { required: 'Please select a date' });
  }, [register]);

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type || 'Expense',
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        paymentMethod: initialData.paymentMethod || 'UPI',
        description: initialData.description || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      reset({
        type: 'Expense',
        amount: '',
        category: 'Food',
        paymentMethod: 'UPI',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, isOpen, reset]);

  const incomeCategories = [
    { value: 'Salary', label: 'Salary' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'Business', label: 'Business' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Other', label: 'Other' },
  ];

  const expenseCategories = [
    { value: 'Food', label: 'Food & Dining' },
    { value: 'Transport', label: 'Transport & Fuel' },
    { value: 'Shopping', label: 'Shopping & Apparel' },
    { value: 'Bills', label: 'Bills & Utilities' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Education', label: 'Education' },
    { value: 'Health', label: 'Health & Medical' },
    { value: 'Travel', label: 'Travel & Vacation' },
    { value: 'Rent', label: 'Rent & Housing' },
    { value: 'Subscriptions', label: 'Subscriptions' },
    { value: 'Other', label: 'Other Expense' },
  ];

  const paymentMethods = [
    { value: 'UPI', label: 'UPI Instant Pay' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Other', label: 'Other' },
  ];

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      description: data.description?.trim() || data.category || 'Transaction',
    };
    onSubmit(formattedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record New Transaction'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Transaction Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-2">
          <button
            type="button"
            onClick={() => {
              setValue('type', 'Expense');
              setValue('category', 'Food');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedType === 'Expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('type', 'Income');
              setValue('category', 'Salary');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedType === 'Income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          icon={DollarSign}
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Please enter transaction amount',
            min: { value: 0.01, message: 'Amount must be greater than 0' },
          })}
        />

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={selectedType === 'Income' ? incomeCategories : expenseCategories}
            {...register('category')}
          />

          <Select
            label="Payment Method"
            options={paymentMethods}
            {...register('paymentMethod')}
          />
        </div>

        {/* Description */}
        <Input
          label="Description / Note (Optional)"
          type="text"
          placeholder="e.g. Grocery Supermarket / Monthly Rent"
          icon={FileText}
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Date with Month and Year Selectors */}
        <DatePicker
          label="Transaction Date"
          value={selectedDate}
          onChange={(newDate) => setValue('date', newDate, { shouldValidate: true })}
          error={errors.date?.message}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant={selectedType === 'Income' ? 'primary' : 'danger'} loading={loading}>
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
