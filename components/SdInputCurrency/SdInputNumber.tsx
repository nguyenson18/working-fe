import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { Controller, FieldValues, UseControllerProps, UseFormReturn } from 'react-hook-form';
import styles from './SdInputNumber.module.scss';

import * as uuid from 'uuid';
export interface SdInputNumberProps {
  value?: string | number | null;
  sdChange?: (value: number) => void;
  form?: UseFormReturn<FieldValues, any>;
  rules?: UseControllerProps['rules']; // form
  required?: boolean;
  min?: number;
  max?: number;
  // Styles
  extraSmall?: boolean;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  errorMessageCustom?: string;
  shrink?: boolean;
  disableErrorMessage?: boolean;
}

export function toVNCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}


export function SdInputNumber(props: SdInputNumberProps & TextFieldProps) {
  const {
    value,
    form,
    required,
    min,
    max,
    shrink,
    disableErrorMessage,
    extraSmall,
    decimalPlaces,
    prefix,
    suffix,
    helperText,
    sdChange,
    ...otherProps
  } = props;
  const [regex, setRegex] = useState<string>('');
  const [viewValue, setViewValue] = useState<string>('');
  const [controlName, setControlName] = useState<string>('');
  let { sx, rules } = props;
  sx = {
    ...sx,
  };
  rules = {
    ...rules,
    required: rules?.required ?? required,
    min: rules?.min ?? min,
    max: rules?.max ?? max,
  };
  // Chuyển đổi số -> chuỗi theo format VN (1234000.23 -> 1.234.000,23)
  const toVNFormat = (value: string) => {
    const arrayNext = value.split(',');
    // Nếu là số thập phân
    if (arrayNext.length >= 2) {
      return `${formatNumber(arrayNext[0])},${arrayNext[1]}`;
    }
    return formatNumber(value);
  };
  const formatNumber = (text: any) => {
    return toVNCurrency((text?.toString() || '').replace(/\./g, ''));
  };
  // Chuyển đổi chuỗi -> số theo chuẩn ISO (1.234.000,23 -> 1234000.23)
  const toNumber = (text: any) => +(text?.toString() || '').replace(/\./g, '').replace(/,/g, '.');
  const onInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = event.target.value;
    if (!val) {
      setViewValue('');
      sdChange?.(null as unknown as number);
      if (form && controlName) {
        const { setValue } = form;
        setValue(controlName, null);
      }
    } else {
      if (!!decimalPlaces) {
        const arrayValue = val.split(',');
        if (arrayValue.length === 2 && arrayValue[1] === '') {
          setViewValue(val);
          return;
        }
      }
      if (val === '-') {
        setViewValue(val);
        return;
      }
      const regExp: RegExp = new RegExp(`^${regex}`, 'g');
      if (regex && !regExp.test(val)) {
        return;
      }
      const numberVal = toNumber(val);
      if (!isNaN(numberVal)) {
        setViewValue(toVNFormat(val) || '');
        sdChange?.(numberVal ?? (null as unknown as number));
        if (form && controlName) {
          const { setValue } = form;
          setValue(controlName, null);
        }
      }
    }
    // return Number.toVNCurrency((val?.toString() || '').replace(/\./g, ''));
  };
  const onBlur = (val: string) => {
    const arrayValue = val.split(',');
    if (arrayValue.length === 2 && arrayValue[1] === '') {
      setViewValue(formatNumber(arrayValue[0]) || '');
      return;
    }
    if (val === '-') {
      setViewValue('');
      sdChange?.(null as unknown as number);
      if (form && controlName) {
        const { setValue } = form;
        setValue(controlName, null);
      }
      return;
    }
    if (val.length > val.trim().length) {
      setViewValue(val.trim());
    }
  };
  useEffect(() => {
    let str = `(([0-9]+(\\.[0-9])?)+)$`;
    if (decimalPlaces) {
      str = `(([0-9]+(\\.[0-9])?)+(\\,[0-9]{0,${decimalPlaces}}){0,1})$`;
    }
    if (max && max < 0) {
      // Negative
      str = `[-]${str}`;
    } else if ((min || min === 0) && min >= 0) {
      // Positive, keep
    } else {
      str = `[-]?${str}`;
    }
    setRegex(`^${str}`);
  }, [decimalPlaces, min, max]);
  useEffect(() => {
    if (value || value === 0) {
      const val = value.toString().replace(/\./g, ',');
      setViewValue(toVNFormat(val) || '');
    } else {
      setViewValue('');
    }
  }, [value]);
  useEffect(() => {
    if (form && controlName) {
      const { setValue, getValues } = form;
      if (value !== getValues(controlName)) {
        setValue(controlName, value);
      }
    }
  }, [controlName, form, value]);
  useEffect(() => {
    if (form) {
      if (!controlName) {
        setControlName(uuid.v4());
      }
    } else {
      setControlName('');
    }
    return () => {
      if (form && controlName) {
        const { unregister } = form;
        unregister(controlName);
      }
    };
  }, [form]);

  if (form && controlName) {
    const {
      formState: { errors },
    } = form;
    const error = errors[controlName];
    let errorMessage = '';
    if (error) {
      if (error.type === 'required') {
        errorMessage = 'Dữ liệu không được để trống';
      }
      if (error.type === 'max') {
        errorMessage = `Giá trị tối đa: ${rules?.max}`;
      }
      if (error.type === 'min') {
        errorMessage = `Giá trị tối thiểu: ${rules?.min}`;
      }
    }
    const helper = disableErrorMessage ? helperText : errorMessage || helperText || ' ';
    return (
      <Controller
        name={controlName}
        control={form.control}
        rules={rules}
        render={({ field }) => (
          <TextField
            {...otherProps}
            {...field}
            className={extraSmall ? styles.extraSmall : ''}
            sx={sx}
            fullWidth
            value={viewValue}
            InputLabelProps={{ shrink: !!value || value === 0 || shrink }}
            size={props.size || 'small'}
            id={controlName}
            error={!!errorMessage}
            helperText={helper}
            required={!!rules?.required}
            onChange={event => {
              field.onChange(event);
              onInputChange(event);
            }}
            onBlur={event => {
              field.onBlur();
              onBlur(event.target.value);
            }}
            InputProps={{
              sx: {
                ...(extraSmall && {
                  paddingX: 0,
                }),
              },
              startAdornment: !!prefix && <InputAdornment position="start">{prefix}</InputAdornment>,
              endAdornment: suffix && <InputAdornment position="end">{suffix}</InputAdornment>,
            }}
          />
        )}
      />
    );
  }
  return (
    <TextField
      {...otherProps}
      className={extraSmall ? styles.extraSmall : ''}
      sx={sx}
      fullWidth
      InputLabelProps={{ shrink: !!value || value === 0 || shrink }}
      helperText={helperText}
      value={viewValue}
      onChange={event => {
        onInputChange(event);
      }}
      onBlur={event => {
        onBlur(event.target.value);
      }}
      InputProps={{
        sx: {
          ...(extraSmall && {
            paddingX: 0,
          }),
        },
        startAdornment: !!prefix && <InputAdornment position="start">{prefix}</InputAdornment>,
        endAdornment: suffix && <InputAdornment position="end">{suffix}</InputAdornment>,
      }}
      size={props.size || 'small'}
    />
  );
}
