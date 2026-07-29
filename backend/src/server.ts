import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`🚀 Mini ERP + CRM backend running on port ${env.port} [${env.nodeEnv}]`);
});
