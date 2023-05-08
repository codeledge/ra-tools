import { Alert, Box, Button, Grid, Typography } from "@mui/material";

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  return (
    <Box>
      <Typography variant="h2">Dashboard</Typography>
      <Typography my={3}>
        Welcome {session?.user?.name}.
        <br /> You are connected to the database:
        <br /> Your role is: {session?.role}
      </Typography>
      {session?.role !== "OWNER" && (
        <Alert
          severity="info"
          sx={{ width: 500 }}
        >
          [FOR DEVELOPMENT ONLY]
          <br />
          You can make yourself an admin/owner by clicking{" "}
          <a href="/api/dev/become-admin">here</a>, changing roles requires you
          to log out and log back in. Once you are an OWNER you can downgrade
          your role in the Admin list.
        </Alert>
      )}
    </Box>
  );
}
