import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';
import { DatePicker } from '../UI/DatePicker';
import { Target, DollarSign, Calendar, FileText } from 'lucide-react';

export const GoalModal = ({
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
      name: '',
      targetAmount: '',
      savedAmount: '0',
      targetDate: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        targetAmount: initialData.targetAmount || '',
        savedAmount: initialData.savedAmount || '0',
        targetDate: initialData.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '',
        description: initialData.description || '',
      });
    } else {
      reset({
        name: '',
        targetAmount: '',
        savedAmount: '0',
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        description: '',
      });
    }
  }, [initialData, isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Goal Name"
          type="text"
          placeholder="e.g. New Laptop / Emergency Fund"
          icon={Target}
          error={errors.name?.message}
          {...register('name', { required: 'Please enter a goal name' })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Amount"
            type="number"
            placeholder="60000"
            icon={DollarSign}
            error={errors.targetAmount?.message}
            {...register('targetAmount', {
              required: 'Please specify target amount',
              min: { value: 1, message: 'Must be greater than 0' },
            })}
          />

          <Input
            label="Initial Saved Amount"
            type="number"
            placeholder="0"
            icon={DollarSign}
            {...register('savedAmount')}
          />
        </div>

        <DatePicker
          label="Target Date"
          value={watch('targetDate')}
          onChange={(newDate) => setValue('targetDate', newDate, { shouldValidate: true })}
          error={errors.targetDate?.message}
        />

        <Input
          label="Description / Purpose"
          type="text"
          placeholder="Why are you saving for this goal?"
          icon={FileText}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialData ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
