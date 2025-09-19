import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.post('/api/jedi', async (req, res) => {
    const prompt = req.body.prompt;
    try {
        const response = await axios.post(`${process.env.AOAI_ENDPOINT}/openai/deployments/${process.env.AOAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AOAI_API_VERSION}`, {
            messages: [
                { role: "system", content: "You are a wise Jedi Master. Respond with Star Wars lore and wisdom." },
                { role: "user", content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.7
        }, {
            headers: {
                "api-key": process.env.AOAI_API_KEY,
                "Content-Type": "application/json"
            }
        });
        res.json({ reply: response.data.choices[0].message.content });
    }
    catch (error) {
        res.status(500).send("Error calling AOAI");
    }
});
app.listen(3000, () => console.log('Jedi GPT API running on port 3000'));
//# sourceMappingURL=index.js.map