
import { app } from "./App";
import * as dotenv from 'dotenv';
import * as exitHook from 'async-exit-hook';

dotenv.config();

(async () => {
    const stopApp = await app();
    exitHook(stopApp)
})();