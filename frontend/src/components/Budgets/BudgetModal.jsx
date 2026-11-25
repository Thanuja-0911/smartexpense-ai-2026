import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { DollarSign } from 'lucide-react';

export const BudgetModal = ({
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
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: 'Food',
      amount: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category || 'Food',
        amount: initialData.amount || '',
      });
    } else {
      reset({
        category: 'Food',
        amount: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const categories = [
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
    { value: 'Other', label: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Monthly Budget' : 'Set Category Budget'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Expense Category" options={categories} {...register('category')} />

        <Input
          label="Monthly Budget Cap"
          type="number"
          step="1"
          placeholder="5000"
          icon={DollarSign}
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Please enter budget limit',
            min: { value: 1, message: 'Budget limit must be at least 1' },
          })}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Update Budget' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
