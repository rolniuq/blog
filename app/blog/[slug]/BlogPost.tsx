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

interface BlogPostProps {
  post: Post;
}

export default function BlogPost({ post }: BlogPostProps) {
  const router = useRouter();

  const formattedDate = post.date
    ? format(new Date(post.date), "MMMM dd, yyyy")
    : "";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{ mb: 3 }}
          aria-label="Go back"
        >
          <ArrowBackIcon />
        </IconButton>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: "white",
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
                    bgcolor: "primary.50",
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
                borderBottom: "1px solid",
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
                bgcolor: "grey.50",
                borderRadius: "0 8px 8px 0",
                "& p": {
                  fontStyle: "italic",
                  color: "text.primary",
                  mb: 0,
                },
              },
              "& pre": {
                bgcolor: "grey.900",
                color: "grey.100",
                p: 2,
                borderRadius: 2,
                overflow: "auto",
                mb: 2,
                fontSize: "0.875rem",
              },
              "& code": {
                fontFamily: "monospace",
              },
              "& :not(pre) > code": {
                bgcolor: "grey.100",
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
                border: "1px solid",
                borderColor: "grey.300",
                p: 1.5,
                textAlign: "left",
              },
              "& th": {
                bgcolor: "grey.100",
                fontWeight: 600,
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: 2,
              },
              "& hr": {
                my: 4,
                border: "none",
                borderTop: "1px solid",
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
