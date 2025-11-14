import { supabase } from "../config/supabaseClient";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export const uploadimageToSupabase = async (userId: string, image: string) => {
    
    console.log("api reached here")
    if (!image.startsWith("data:image/")) {
        throw new Error("Invalid image format. Must be base64 encoded image.");
    }

    const mimeType = image.substring(
        image.indexOf(":") + 1,
        image.indexOf(";")
    );

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error("Unsupported image type. Only PNG and JPG are allowed.");
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const extension = mimeType.split("/")[1];
    const fileName = `user-${userId}-${Date.now()}.${extension}`;

    const { data, error } = await supabase.storage
        .from("picture")
        .upload(fileName, buffer, {
            cacheControl: "3600",
            upsert: true,
            contentType: mimeType,
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from("picture").getPublicUrl(fileName)

    return publicUrlData.publicUrl
}