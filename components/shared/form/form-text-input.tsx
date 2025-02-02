import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Control, ControllerRenderProps, FieldValues, Path } from 'react-hook-form'
import { Input } from '@/components/ui/input'

interface FormInputProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  control: Control<T>
  type?: string
  disabled?: boolean
}

export function FormTextInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  type = 'text',
  disabled = false
}: FormInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<T, Path<T>> }) => (
        <FormItem className="w-full">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input type={type} placeholder={placeholder} disabled={disabled} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
