import { defineStore } from 'pinia';

const STORAGE_KEY = 'vote-system-state';

const createDefaultState = () => ({
  currentVote: null,
  createdVotes: [],
  votedRecords: []
});

const toISODateString = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : createDefaultState();
    return {
      currentVote: parsed.currentVote ?? null,
      createdVotes: Array.isArray(parsed.createdVotes) ? parsed.createdVotes : [],
      votedRecords: Array.isArray(parsed.votedRecords) ? parsed.votedRecords : []
    };
  } catch {
    return createDefaultState();
  }
};

export const useVoteStore = defineStore('vote', {
  state: () => loadState(),
  getters: {
    hasLoadedVote: (state) => Boolean(state.currentVote),
    votedCount: (state) => state.votedRecords.length
  },
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentVote: this.currentVote,
        createdVotes: this.createdVotes,
        votedRecords: this.votedRecords
      }));
    },
    setCurrentVote(vote) {
      this.currentVote = vote;
      this.persist();
    },
    addCreatedVote(vote) {
      const normalized = {
        ...vote,
        createdAt: toISODateString(vote.createdAt) || new Date().toISOString()
      };
      const exists = this.createdVotes.some((item) => item.id === normalized.id);
      this.createdVotes = exists
        ? this.createdVotes.map((item) => (item.id === normalized.id ? { ...item, ...normalized } : item))
        : [normalized, ...this.createdVotes];
      this.persist();
    },
    addVotedRecord(record) {
      this.votedRecords = [
        {
          ...record,
          votedAt: toISODateString(record.votedAt) || new Date().toISOString()
        },
        ...this.votedRecords
      ];
      this.persist();
    },
    clearCurrentVote() {
      this.currentVote = null;
      this.persist();
    }
  }
});
