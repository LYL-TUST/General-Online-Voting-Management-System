import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

const votes = new Map();

const now = () => new Date().toISOString();
const calcParticipants = (options) => options.reduce((sum, item) => sum + item.votes, 0);
const normalizeOptions = (options) => options.map((time, index) => ({ id: index + 1, time: String(time).trim(), votes: 0 }));
const serializeVote = (vote) => ({ ...vote, participants: calcParticipants(vote.options) });

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'ok' }));

app.post('/api/votes', (req, res) => {
  const { topic, options } = req.body || {};
  if (!topic?.trim()) return res.status(400).json({ success: false, message: '会议主题不能为空' });
  if (!Array.isArray(options) || options.length !== 3 || options.some((item) => !String(item || '').trim())) {
    return res.status(400).json({ success: false, message: '3个候选时间都必须填写' });
  }
  const id = uuidv4().replace(/-/g, '').slice(0, 8);
  const vote = { id, topic: topic.trim(), options: normalizeOptions(options), createdAt: now(), updatedAt: now() };
  votes.set(id, vote);
  res.json({ success: true, voteId: id, data: serializeVote(vote) });
});

app.get('/api/votes/:id', (req, res) => {
  const vote = votes.get(req.params.id);
  if (!vote) return res.status(404).json({ success: false, message: '投票不存在' });
  res.json({ success: true, data: serializeVote(vote) });
});

app.post('/api/votes/:id/vote', (req, res) => {
  const vote = votes.get(req.params.id);
  if (!vote) return res.status(404).json({ success: false, message: '投票不存在' });
  const option = vote.options.find((item) => item.id === Number(req.body?.optionId));
  if (!option) return res.status(400).json({ success: false, message: '投票选项不存在' });
  option.votes += 1;
  vote.updatedAt = now();
  res.json({ success: true, data: serializeVote(vote) });
});

app.delete('/api/votes/:id', (req, res) => {
  const existed = votes.delete(req.params.id);
  if (!existed) return res.status(404).json({ success: false, message: '投票不存在' });
  res.json({ success: true });
});

app.get('/api/votes', (_req, res) => {
  res.json({ success: true, data: [...votes.values()].map(serializeVote) });
});

app.listen(PORT, () => console.log(`Vote server running on http://localhost:${PORT}`));
