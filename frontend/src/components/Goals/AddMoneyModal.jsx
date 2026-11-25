import React from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { DollarSign } from 'lucide-react';

export const AddMoneyModal = ({
  isOpen,
  onClose,
  onSubmit,
  goal = null,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { addAmount: '' },
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deposit Money — ${goal?.name || 'Goal'}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <p className="text-xs text-slate-400">
          Add funds to your <strong className="text-slate-200">{goal?.name}</strong> savings goal.
          Remaining target: <span className="text-brand-400 font-semibold">₹{goal?.remaining?.toLocaleString('en-IN')}</span>.
        </p>

        <Input
          label="Deposit Amount"
          type="number"
          step="1"
          placeholder="2000"
          icon={DollarSign}
          error={errors.addAmount?.message}
          {...register('addAmount', {
            required: 'Please enter deposit amount',
            min: { value: 1, message: 'Deposit must be at least 1' },
          })}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Deposit Savings
          </Button>
        </div>
      </form>
    </Modal>
  );
};
