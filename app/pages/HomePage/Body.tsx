"use client";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Article from "^@/app/components/Article";
import { TArticle } from "^@/app/types/Article";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const data: TArticle[] = [
  {
    id: "1",
    title: "Card 1",
    content: "Content for Card 1",
  },
  {
    id: "2",
    title: "Card 2",
    content: "Content for Card 2",
  },
  {
    id: "3",
    title: "Card 3",
    content: "Content for Card 3",
  },
  {
    id: "4",
    title: "Card 4",
    content: "Content for Card 4",
  },
  {
    id: "5",
    title: "Card 5",
    content: "Content for Card 5",
  },
  {
    id: "6",
    title: "Card 6",
    content: "Content for Card 6",
  },
];

export default function Body() {
  return (
    <Container>
      <Grid container spacing={1}>
        {data.map((article) => (
          <Grid key={article.title} item xs={3}>
            <Article
              id={article.id}
              title={article.title}
              content={article.content}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
