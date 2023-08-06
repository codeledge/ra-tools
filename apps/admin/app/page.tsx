"use client";
import { SessionProvider } from "next-auth/react";
import ReactAdmin from "./ReactAdmin";

const HomePage = () => {
  return (
    <SessionProvider>
      <ReactAdmin />
    </SessionProvider>
  );
};

export default HomePage;
