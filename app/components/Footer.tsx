import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: "auto",
        bgcolor: "grey.100",
        borderTop: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {new Date().getFullYear()} My Blog. Built with Next.js.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            <MuiLink
              component={Link}
              href="/"
              color="text.secondary"
              underline="hover"
            >
              Home
            </MuiLink>
            <MuiLink
              component={Link}
              href="/about"
              color="text.secondary"
              underline="hover"
            >
              About
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
