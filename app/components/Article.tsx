"use client";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PostMeta } from "@/lib/posts";

export default function Article({
  slug,
  title,
  excerpt,
  date,
  coverImage,
  tags,
}: PostMeta) {
  const router = useRouter();

  const formattedDate = date ? format(new Date(date), "MMM dd, yyyy") : "";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.3s ease",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
        },
      }}
      onClick={() => router.push(`/blog/${slug}`)}
    >
      <CardMedia
        component="img"
        height="180"
        image={coverImage}
        alt={title}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: "flex", gap: 0.5, mb: 1.5, flexWrap: "wrap" }}>
          {tags.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.7rem",
                bgcolor: "primary.50",
                color: "primary.main",
              }}
            />
          ))}
        </Box>

        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 1,
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.6,
          }}
        >
          {excerpt}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.disabled",
            mt: "auto",
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption">{formattedDate}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
