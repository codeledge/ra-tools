"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("./AdminApp"), {
  ssr: false,
  loading: () => <p>Loading admin…</p>,
});

export default AdminApp;
