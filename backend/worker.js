import { httpServerHandler } from 'cloudflare:node';
import  './src/server.js'; 

export default httpServerHandler({ port: 3000 });