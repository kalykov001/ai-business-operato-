import createApi from "./createApi";
import { env } from "./config/env";
const app = createApi();
app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
});
