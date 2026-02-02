"use client";

import React, { useCallback, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

const drawerWidth = 260;

const nav = [
  { label: "Hôm nay", href: "/today" },
  { label: "Công việc", href: "/inbox" },
  { label: "Quản lý công việc", href: "/calendar" },
  { label: "Tổng kết tuần", href: "/review/weekly" },
  { label: "Cài đặt", href: "/settings" },
  { label: "Dự án", href: "/projects" },
  { label: "Thẻ", href: "/tags" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("accessToken");
    } catch {}
    router.replace("/login");
  }, [router]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography fontWeight={900} sx={{ flex: 1 }}>
            Thời gian làm việc
          </Typography>
          <Button color="inherit" onClick={logout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 1 }}>
          <List>
            {nav.map((i) => {
              const active =
                pathname === i.href || (pathname?.startsWith(i.href + "/") ?? false);

              return (
                <Link
                  key={i.href}
                  href={i.href}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ListItemButton selected={active} sx={{ borderRadius: 2 }}>
                    <ListItemText primary={i.label} />
                  </ListItemButton>
                </Link>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 2 }}>
        <Toolbar />
        <>{children}</> 
      </Box>
    </Box>
  );
}
