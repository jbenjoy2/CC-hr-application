import app from "./app";
const PORT = process.env.PORT || 3001;
app.listen(Number(PORT), "0.0.0.0", () =>
  console.log(`Server running on ${PORT}`)
);
