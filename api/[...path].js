// Vercel routes every /api/* request to this catch-all serverless function.
// The Express app itself already defines full paths like "/api/register",
// so it just needs to receive the request as-is — no extra routing here.
module.exports = require("../server/app");
