/**
 * @author Enéas Almeida <eneas.eng@yahoo.com>
 * @description Resiliência de aplicações com Axios Retry
 */
const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry');

const app = express();

app.get('/', async (_req, res) => {
    const axiosClient = axios.create();

    const exponentialBackoff = (retryNumber) => {
        const baseDelay = 1000;
        const maxDelay = 5000;
        return Math.min(baseDelay * 2 ** retryNumber, maxDelay);
    };

    axiosRetry(axiosClient, {
        retries: 3,
        retryDelay: exponentialBackoff,
        retryCondition: axiosRetry.isNetworkOrIdempotentRequestError, // Apenas para idempotentes (GET, PUT, DELETE)
    });

    await axiosClient
        .get('http://www.google.com')
        .then((result) => {
            res.json(result.data);
        })
        .catch((err) => {
            if (err.response.status !== 200) {
                throw new Error(
                    `Erro na chamada da API: ${err.response.status}, após 3 tentativas.`
                );
            }
        });
});

app.listen(3000, () => {
    console.log('Listen in port 3000');
});
