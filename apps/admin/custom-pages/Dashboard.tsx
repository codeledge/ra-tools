import { Alert, Box, Typography } from "@mui/material";

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <Box>
      <Typography variant="h2">Dashboard</Typography>
      <Typography my={3}>
        Welcome {session?.user?.name}.
        <br /> You are connected to the database: TODO
        <br /> Your role is: {session?.user?.role}
      </Typography>
      {session?.user?.role !== "OWNER" && (
        <Alert severity="info" sx={{ width: 500 }}>
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
