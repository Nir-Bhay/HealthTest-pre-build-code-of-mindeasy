const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const API_KEY = "API_KEY = AIzaSyB5aSJbjXBMEDpLhjzbA6mPTXhkzwfQ_UY"
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(API_KEY);

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
    try {
        const data = fs.readFileSync(path);
        return {
            inlineData: {
                data: Buffer.from(data).toString("base64"),
                mimeType
            },
        };
    } catch (error) {
        console.error(`Error reading file ${path}:`, error);
        return null;
    }
}

async function run() {
    // For text-and-image input (multimodal), use the gemini-pro-vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = "can you help me to identify whant was in a image , everything  that i can see";

    const imagePath = "E:\\open quize\\public\\IMG_20230814_191630.jpg"; // Update the file path
    const imageParts = [
        fileToGenerativePart(imagePath, "jpg"),
    ];

    if (!imageParts[0]) {
        console.error("Image file could not be read. Aborting.");
        return;
    }

    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        console.log(text);
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

run();
