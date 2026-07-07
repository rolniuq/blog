"use client";

import {
  Container,
  Typography,
  Box,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post } from "@/lib/posts";
import { format } from "date-fns";
import { useTheme } from "@mui/material/styles";

interface BlogPostProps {
  post: Post;
}

export default function BlogPost({ post }: BlogPostProps) {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const formattedDate = post.date
    ? format(new Date(post.date), "MMMM dd, yyyy")
    : "";

  // Code block colors — stay dark in both modes for readability
  const codeBlockBg = isDark ? "#070b12" : "#0f172a";
  const codeBlockText = isDark ? "#e2e8f0" : "#f1f5f9";

  const handleBackdropClick = () => {
    router.push("/");
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Box
      onClick={handleBackdropClick}
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        cursor: "pointer",
      }}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            router.back();
          }}
          sx={{ mb: 3, color: "text.secondary" }}
          aria-label="Go back"
        >
          <ArrowBackIcon />
        </IconButton>

        <Paper
          elevation={isDark ? 2 : 0}
          onClick={handleContentClick}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: "background.paper",
            cursor: "default",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                lineHeight: 1.2,
              }}
            >
              {post.title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                mb: 3,
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">{formattedDate}</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: isDark ? "rgba(96, 165, 250, 0.12)" : "rgba(25, 118, 210, 0.08)",
                    color: "primary.main",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              "& h1": {
                fontSize: "2rem",
                fontWeight: 700,
                mt: 4,
                mb: 2,
              },
              "& h2": {
                fontSize: "1.5rem",
                fontWeight: 600,
                mt: 4,
                mb: 2,
                pb: 1,
                borderBottom: 1,
                borderColor: "grey.200",
              },
              "& h3": {
                fontSize: "1.25rem",
                fontWeight: 600,
                mt: 3,
                mb: 1.5,
              },
              "& p": {
                mb: 2,
                lineHeight: 1.8,
                color: "text.secondary",
              },
              "& ul, & ol": {
                pl: 3,
                mb: 2,
              },
              "& li": {
                mb: 1,
                lineHeight: 1.7,
                color: "text.secondary",
              },
              "& blockquote": {
                borderLeft: "4px solid",
                borderColor: "primary.main",
                pl: 3,
                py: 1,
                my: 3,
                bgcolor: isDark ? "rgba(255,255,255,0.03)" : "grey.50",
                borderRadius: "0 8px 8px 0",
                "& p": {
                  fontStyle: "italic",
                  color: "text.primary",
                  mb: 0,
                },
              },
              "& pre": {
                bgcolor: codeBlockBg,
                color: codeBlockText,
                p: 2,
                borderRadius: 2,
                overflow: "auto",
                mb: 2,
                fontSize: "0.875rem",
                border: isDark ? "1px solid" : "none",
                borderColor: isDark ? "grey.200" : "transparent",
              },
              "& code": {
                fontFamily: "monospace",
              },
              "& :not(pre) > code": {
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "grey.100",
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.875rem",
                color: "primary.main",
              },
              "& a": {
                color: "primary.main",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              },
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                mb: 2,
              },
              "& th, & td": {
                border: 1,
                borderColor: "grey.300",
                p: 1.5,
                textAlign: "left",
              },
              "& th": {
                bgcolor: isDark ? "rgba(255,255,255,0.04)" : "grey.100",
                fontWeight: 600,
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: 2,
              },
              "& hr": {
                my: 4,
                border: "none",
                borderTop: 1,
                borderColor: "grey.200",
              },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
