const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
app.use(express.json());

async function tsk(uid) {
    const msg = `${uid} - task completed at - ${new Date().toISOString()}\n`;
    console.log(msg);
    fs.appendFileSync('task.log', msg);
}

const createLimiter = (max1, max2) => {
    return [
        rateLimit({
            windowMs: 1000,
            max: max1,
            keyGenerator: (req) => req.body.user_id,
            handler: (req, res, next) => {
                req.isRateLimited = true;
                next();
            }
        }),
        rateLimit({
            windowMs: 60 * 1000,
            max: max2,
            keyGenerator: (req) => req.body.user_id,
            handler: (req, res, next) => {
                req.isRateLimited = true;
                next();
            }
        })
    ];
};

const q = {};
const processQ = (uid) => {
    if (q[uid] && q[uid].length > 0) {
        setTimeout(async () => {
            const nextTsk = q[uid].shift();
            await tsk(nextTsk.uid);
            if (q[uid].length > 0) {
                processQ(uid);
            }
        }, 1000);
    }
};

const queueMW = (req, res) => {
    const uid = req.body.user_id;
    if (!q[uid]) {
        q[uid] = [];
    }
    q[uid].push({ uid });
    if (q[uid].length === 1) {
        processQ(uid);
    }
    res.status(202).send('Task queued');
};

const [limiter1, limiter2] = createLimiter(1, 20);
app.post('/api/v1/task', limiter1, limiter2, (req, res, next) => {
    if (req.isRateLimited) {
        return res.status(429).send('Rate limit exceeded');
    }
    next();
}, queueMW);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
