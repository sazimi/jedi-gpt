import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post('/api/jedi', async (req, res) => {
//   const prompt = req.body.prompt;
//   console.log("Received prompt:", prompt);
//   console.log("Using AOAI endpoint:", process.env.AOAI_ENDPOINT);

//   try {
//     // Construct the URL properly to avoid double slashes
//     const endpoint = process.env.AOAI_ENDPOINT?.endsWith('/') 
//       ? process.env.AOAI_ENDPOINT.slice(0, -1) 
//       : process.env.AOAI_ENDPOINT;
    
//     const url = `${endpoint}/openai/deployments/${process.env.AOAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AOAI_API_VERSION}`;
//     console.log("Calling URL:", url);

//     const response = await axios.post(
//       url,
//       {
//         messages: [
//           { role: "system", content: "You are a wise Jedi Master. Respond with Star Wars lore and wisdom." },
//           { role: "user", content: prompt }
//         ],
//         max_tokens: 500,
//         temperature: 0.7
//       },
//       {
//         headers: {
//           "api-key": process.env.AOAI_API_KEY,
//           "Content-Type": "application/json"
//         }
//       }
//     );
//     console.log("AOAI response:", response.data);

//     res.json({ reply: response.data.choices[0].message.content });
//   } catch (error: any) {
//     console.error("Error calling AOAI:", error);
    
//     // Log more specific error details if available
//     if (error.response) {
//       console.error("Error response status:", error.response.status);
//       console.error("Error response data:", error.response.data);
//     }
    
//     res.status(500).json({ 
//       error: "Error calling AOAI",
//       details: error.response?.data || error.message 
//     });
//   }
// });

// app.listen(3000, () => console.log('Jedi GPT API running on port 3000'));
const endpoint = process.env.AOAI_ENDPOINT
const modelName = process.env.AOAI_MODEL_NAME
const deployment = process.env.AOAI_DEPLOYMENT_NAME
const apiVersion = process.env.AOAI_API_VERSION || "2024-06-01-preview";

if (!endpoint || !modelName || !deployment) {
  console.error("Missing required environment variables. Please set AOAI_ENDPOINT, AOAI_MODEL_NAME, and AOAI_DEPLOYMENT_NAME.");
  process.exit(1);
} 
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/jedi', async (req, res) => {
  const prompt = req.body.prompt;
  console.log("Received prompt:", prompt);
  console.log("Using AOAI endpoint:", endpoint);

  try {
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    console.log("Calling URL:", url);

    const response = await axios.post(
      url,
      {
        messages: [
          { role: "system", content: "You are a wise Jedi Master. Respond with Star Wars lore and wisdom." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          "api-key": process.env.AOAI_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error: any) {
    
    // Log more specific error details if available
    if (error.response) {
      console.error("Error response status:", error.response.status);
      console.error("Error response data:", error.response.data);}
    
    res.status(500).json({ 
      error: "Error calling AOAI",
      details: error.response?.data || error.message 
    });
  }
});

app.listen(3000, () => console.log('Jedi GPT API running on port 3000'));   