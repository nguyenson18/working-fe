"use client";

import { Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerApi } from "@/src/lib/auth";

const schema = z
  .object({
    name: z.string().optional(),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerApi(values.email, values.password, values.name?.trim() || undefined);

      const next = new URLSearchParams(window.location.search).get("next") || "/today";
      router.replace(next);
    } catch (e) {
      // Interceptor sẽ show snackbar. Ở đây set lỗi “đúng field” cho dễ nhìn.
      setError("email", { type: "manual", message: "Không đăng ký được email này" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900}>
            Tạo tài khoản
          </Typography>

          <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Tên (tuỳ chọn)"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              label="Mật khẩu"
              type="password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              label="Nhập lại mật khẩu"
              type="password"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Đăng ký"}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Đã có tài khoản?{" "}
            <Link href="/login" style={{ fontWeight: 700 }}>
              Đăng nhập
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
