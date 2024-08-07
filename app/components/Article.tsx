"use client";

import { Card, CardContent, Typography } from "@mui/material";
import { TArticle } from "../types/Article";

export default function Article({ id, title, content }: TArticle) {
  function onClick() {
    console.log("clicked");
  }

  return (
    <Card sx={{ minWidth: 275 }} onClick={onClick}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2">{content}</Typography>
      </CardContent>
    </Card>
  );
}
