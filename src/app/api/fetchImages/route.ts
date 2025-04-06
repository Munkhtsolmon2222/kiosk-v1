import axios from "axios";

// Define types for the image data
type CloudinaryImage = {
  secure_url: string;
};

type CloudinaryResponse = {
  resources: CloudinaryImage[];
};

// Export the GET method handler
export async function GET() {
  try {
    // Get Cloudinary credentials from environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: "Missing Cloudinary environment variables." }),
        { status: 500 }
      );
    }

    // Fetch images from Cloudinary
    const { data } = await axios.get<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${apiKey}:${apiSecret}`
          ).toString("base64")}`,
        },
        params: {
          max_results: 100, // Limit the number of images fetched
        },
      }
    );

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch images" }), {
      status: 500,
    });
  }
}
