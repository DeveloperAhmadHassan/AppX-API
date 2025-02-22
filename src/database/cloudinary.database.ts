import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
const { CLOUDNAME, APIKEY, APISECRET } = process.env;

export const cloudinary_options=  cloudinary.config({
    cloud_name: CLOUDNAME,
    api_key: APIKEY,
    api_secret: APISECRET
});
