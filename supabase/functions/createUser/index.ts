import { createEdgeHandler } from "../_shared/handler.ts";
import { definition } from "./handler.ts";

Deno.serve(createEdgeHandler(definition));
