import { Container, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Article from "@/app/components/Article";
import { getAllPosts } from "@/lib/posts";

export default function Body() {
  const posts = getAllPosts();

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Daily Blog
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto" }}
          >
            Thoughts, learnings, and experiences from my journey
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {posts.map((post) => (
            <Grid key={post.slug} item xs={12} sm={6} md={4}>
              <Article {...post} />
            </Grid>
          ))}
        </Grid>

        {posts.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="text.secondary">
              No blog posts yet. Add markdown files to the /posts folder.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
