import { SxProps } from "@mui/material";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  FieldValues,
  UseControllerProps,
  UseFormReturn,
} from "react-hook-form";
import * as uuid from "uuid";

dayjs.extend(customParseFormat);

interface Props {
  label?: string;
  value: string | undefined; // bạn đang lưu "MM/DD/YYYY"
  sdChange?: (value: string | undefined) => void;
  required?: boolean;
  disabled?: boolean;
  minDate?: any;
  maxDate?: any;
  sx?: SxProps;
  form?: UseFormReturn<FieldValues, any>;
  rules?: UseControllerProps["rules"];
  disableErrorMessage?: boolean;
}

const parseMMDDYYYY = (v?: string) => {
  if (!v) return null;
  const d = dayjs(v, "MM/DD/YYYY", true);
  return d.isValid() ? d : null;
};

const toDayjs = (v: any) => {
  if (!v) return null;
  if (dayjs.isDayjs(v)) return v;
  if (v instanceof Date) return dayjs(v);
  if (typeof v === "string") {
    const d1 = dayjs(v, "MM/DD/YYYY", true);
    if (d1.isValid()) return d1;
    const d2 = dayjs(v, "DD/MM/YYYY", true);
    if (d2.isValid()) return d2;
    const d3 = dayjs(v);
    return d3.isValid() ? d3 : null;
  }
  const d = dayjs(v);
  return d.isValid() ? d : null;
};

export function SdDate(props: Props) {
  const [controlName, setControlName] = useState<string>("");

  const {
    label,
    disabled,
    required,
    value,
    sdChange,
    sx,
    form,
    minDate,
    maxDate,
    rules: rulesProp,
    disableErrorMessage,
  } = props;

  const rules = {
    ...rulesProp,
    required: rulesProp?.required ?? required,
  };

  useEffect(() => {
    setControlName(uuid.v4());
  }, [form]);

  useEffect(() => {
    if (form && controlName) {
      form.setValue(controlName, value ?? null);
    }
  }, [value, controlName, form]);

  const pickerValue = useMemo(() => parseMMDDYYYY(value), [value]);
  const minD = useMemo(() => toDayjs(minDate), [minDate]);
  const maxD = useMemo(() => toDayjs(maxDate), [maxDate]);

  const errorMessage = useMemo(() => {
    let msg = "";

    if (pickerValue && maxD && pickerValue.isAfter(maxD, "day")) {
      msg = `Ngày lớn nhất ${maxD.format("DD/MM/YYYY")}`;
    }
    if (pickerValue && minD && pickerValue.isBefore(minD, "day")) {
      msg = `Ngày nhỏ nhất ${minD.format("DD/MM/YYYY")}`;
    }

    if (form && controlName) {
      const err = (form.formState.errors as any)?.[controlName];
      if (err?.type === "required") msg = "Dữ liệu không được để trống";
      if (err?.type === "pattern") msg = "Nhập không đúng định dạng";
    }

    return msg;
  }, [pickerValue, minD, maxD, form, controlName]);

  const handleChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      sdChange?.(undefined);
      return;
    }
    sdChange?.(newValue.format("MM/DD/YYYY")); // giữ output như code cũ
  };

  const picker = (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopDatePicker
        label={label}
        // ✅ v6 dùng `format` thay cho `inputFormat`
        format="DD/MM/YYYY"
        value={pickerValue}
        minDate={minD ?? undefined}
        maxDate={maxD ?? undefined}
        onChange={handleChange}
        disabled={disabled}
        // ✅ v6 dùng slotProps thay cho renderInput
        slotProps={{
          textField: {
            fullWidth: true,
            sx,
            required: !!rules.required,
            size: "small",
            error: !!errorMessage,
            helperText: disableErrorMessage ? "" : errorMessage || " ",
          },
        }}
      />
    </LocalizationProvider>
  );

  if (!form) return picker;

  return (
    <Controller
      name={controlName}
      control={form.control}
      rules={rules}
      render={() => picker}
    />
  );
}

export default SdDate;
