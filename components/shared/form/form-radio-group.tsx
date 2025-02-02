import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Control, FieldValues, Path } from 'react-hook-form'

interface FormRadioGroupProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  options: Array<string>
}

export function FormRadioGroup<T extends FieldValues>({
  name,
  control,
  options
}: FormRadioGroupProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-col space-y-2">
              {options.map((item) => (
                <FormItem key={item} className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={item} />
                  </FormControl>
                  <FormLabel className="font-normal">{item}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
