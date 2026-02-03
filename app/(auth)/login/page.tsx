"use client";

import {
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";
import { login } from "@/src/lib/auth";
import { notifier } from "@/src/lib/notifier";
import Link from "next/link";
import { LoadingButton } from "@mui/lab";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await login(values.email, values.password).then((res) => {
      if (res.success) {
        notifier("Đăng nhập thành công", { variant: "success" });
        router.replace("/today");
      }
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Đăng nhập
        </Typography>

        <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
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
          <Typography variant="body2" color="text.secondary">
            Chưa có tài khoản?{" "}
            <Link href="/register" style={{ fontWeight: 700 }}>
              Đăng ký
            </Link>
          </Typography>
          <LoadingButton type="submit" variant="contained" disabled={isSubmitting}>
            Đăng nhập
          </LoadingButton>
        </Stack>
      </Paper>
    </Container>
  );
}
