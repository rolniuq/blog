import { Container, Typography, Box, Paper, Avatar } from "@mui/material";
import Header from "@/app/components/Header";

export const metadata = {
  title: "About | My Blog",
  description: "Learn more about me and this blog",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <Box sx={{ bgcolor: "grey.50", minHeight: "calc(100vh - 64px)", py: 6 }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              bgcolor: "white",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Avatar
                src="/images/dev.png"
                alt="Profile"
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                }}
              />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                About Me
              </Typography>
            </Box>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.8, mb: 3 }}
            >
              Welcome to my blog! I&apos;m a developer who loves to share
              knowledge and document my learning journey. This blog is my
              digital garden where I plant ideas and watch them grow.
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.8, mb: 3 }}
            >
              Here you&apos;ll find posts about programming, productivity,
              personal growth, and anything else that catches my interest. I
              believe in learning in public and sharing what I discover along
              the way.
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
              How This Blog Works
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.8 }}
            >
              This blog is built with Next.js and renders markdown files. To
              add a new post, simply create a markdown file in the{" "}
              <code>/posts</code> folder with frontmatter containing title,
              date, excerpt, and tags. The blog will automatically pick it up
              and display it on the homepage.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
