import React, { useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { signIn } from "next-auth/react";
import { useCheckAuth } from "react-admin";
import Router from "next/router";
import Link from "next/link";

const LoginPage = () => {
  const checkAuth = useCheckAuth();

  useEffect(() => {
    checkAuth({}, false)
      .then(() => {
        // already authenticated, redirect to the home page
        Router.push("/");
      })
      .catch(() => {
        // not authenticated, stay on the login page
      });
  }, [checkAuth]);

  return (
    <ThemeProvider theme={createTheme()}>
      <Container
        component="main"
        maxWidth="xs"
      >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography
            component="h1"
            variant="h5"
          >
            Sign in
          </Typography>
          <Box
            component="form"
            noValidate
            sx={{ mt: 1 }}
          >
            <Button
              // type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => signIn("google")}
            >
              Sign In with Google
            </Button>
          </Box>
          <Link href="/api/auth/signin">Login by password</Link>
        </Box>
      </Container>
    </ThemeProvider>
  );
};
{
  /* <>
      Not signed in <br />
      
    </> */
}

export default LoginPage;
