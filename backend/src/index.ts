import "dotenv/config";
import createApi from "./createApi";


const app = createApi();

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log("🔥 AI BUSINESS OPERATOR BACKEND");
  console.log(`🔥 http://localhost:${PORT}`);
  console.log("🔥 SERVER IS ACTUALLY LISTENING");
  console.log("=================================");
});

server.on("error", (error) => {
  console.error("🔥 SERVER ERROR:", error);
});