import createApi from "./createApi";
import { env } from "./config/env";
const port = Number(process.env.PORT) || 5000;
const app = createApi();
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
