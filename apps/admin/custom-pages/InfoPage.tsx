import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { tables } from "../generate/helper";

const InfoPage = () => {
  return (
    <Box p={3}>
      <Typography variant="h5">Links</Typography>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {tables.map((table) => (
          <ListItem key={table}>
            <ListItemText>{table}</ListItemText>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InfoPage;
