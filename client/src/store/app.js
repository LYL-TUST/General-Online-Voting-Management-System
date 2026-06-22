import { defineStore } from 'pinia';

const STORAGE_KEY = 'vote-app-state';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    loading: false,
    createdVotes: [],
    voteRecords: [],
    currentVote: null,
    ...loadState()
  }),
  getters: {
    votedIds: (state) => [...new Set(state.voteRecords.map((item) => item.voteId))],
    isVoted: (state) => (voteId) => state.voteRecords.some((item) => item.voteId === voteId)
  },
  actions: {
    hydrate() {
      const state = loadState();
      this.$patch({
        sidebarCollapsed: state.sidebarCollapsed ?? false,
        loading: false,
        createdVotes: state.createdVotes ?? [],
        voteRecords: state.voteRecords ?? [],
        currentVote: state.currentVote ?? null
      });
    },
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sidebarCollapsed: this.sidebarCollapsed,
        createdVotes: this.createdVotes,
        voteRecords: this.voteRecords,
        currentVote: this.currentVote
      }));
    },
    setLoading(value) {
      this.loading = value;
      this.persist();
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      this.persist();
    },
    setCurrentVote(vote) {
      this.currentVote = vote;
      this.syncCreatedVote(vote);
      this.persist();
    },
    addCreatedVote(vote) {
      const next = {
        ...vote,
        createdAt: vote.createdAt || new Date().toISOString(),
        participants: vote.participants ?? 0,
        options: (vote.options || []).map((item, index) => ({
          id: item.id ?? index + 1,
          label: item.label ?? item.time ?? '',
          note: item.note ?? '',
          votes: item.votes ?? 0
        }))
      };
      this.createdVotes = [next, ...this.createdVotes.filter((item) => item.id !== next.id)];
      this.persist();
    },
    syncCreatedVote(vote) {
      if (!vote?.id) return;
      const next = {
        ...vote,
        participants: vote.participants ?? (vote.options || []).reduce((sum, item) => sum + (item.votes || 0), 0)
      };
      const index = this.createdVotes.findIndex((item) => item.id === vote.id);
      if (index >= 0) {
        this.createdVotes.splice(index, 1, next);
      }
      this.persist();
    },
    removeCreatedVote(voteId) {
      this.createdVotes = this.createdVotes.filter((item) => item.id !== voteId);
      this.persist();
    },
    addVoteRecord(record) {
      this.voteRecords = [{ ...record, votedAt: record.votedAt || new Date().toISOString() }, ...this.voteRecords];
      this.persist();
    }
  }
});
