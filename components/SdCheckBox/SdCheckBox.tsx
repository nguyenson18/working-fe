import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material';
import { FieldValues, UseControllerProps, UseFormReturn } from 'react-hook-form';

export interface SdCheckBoxProps {
  sdChange?: (value: boolean) => void;
  form?: UseFormReturn<FieldValues, any>;
  label?: string;
}

export function SdCheckBox(props: SdCheckBoxProps & Omit<CheckboxProps, 'form'>) {
  const { sdChange, form, label, value, ...checkboxProps } = props;

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={!!value}
          onChange={e => {
            sdChange?.(e.target.checked);
          }}
          {...checkboxProps}
        />
      }
      label={label || ""}
    />
  );
}
