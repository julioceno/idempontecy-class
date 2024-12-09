import express, { Request, Response } from "express"
import Redis from "ioredis";

const app = express();
const port = 3030;

app.use(express.json());

const redis = new Redis();

interface PaymentBody {
    userId: string;
    currency: number;
}

app.post('/payment', async (req: Request<{}, {}, PaymentBody>, res: Response) => {
    const key = `${req.body.userId}-${req.body.currency}`
    const existsIdempontency = await redis.exists(key);

    if(existsIdempontency) {
        res.status(400).json({ message: "Já existe um processamento de pagamento em andamento." });
        return  
    }

    const ttl = 60 * 5;
    await redis.set(key, 'processing', "EX", ttl);
    res.status(202).json({ message: "O processamento de pagamento foi iniciado com sucesso. Por favor, aguarde enquanto finalizamos sua transação." });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});