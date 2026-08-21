import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";
import Pepe from "./Pepe";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: "auto",
        bgcolor: "background.paper",
        borderTop: 1,
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Pepe size={22} />
            <Typography variant="body2" color="text.secondary">
              {new Date().getFullYear()} Raymond&apos;s Notebook. Built with Next.js.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <MuiLink
              component={Link}
              href="/"
              color="text.secondary"
              underline="hover"
              sx={{
                "&:hover": { color: "primary.main" },
              }}
            >
              Home
            </MuiLink>
            <MuiLink
              component={Link}
              href="/about"
              color="text.secondary"
              underline="hover"
              sx={{
                "&:hover": { color: "primary.main" },
              }}
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
