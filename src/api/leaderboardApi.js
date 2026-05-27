import api from './axios'

export const getLeaderboard = () =>
  api.get('/api/leaderboard')

export const getTopicLeaderboard = (topic) =>
  api.get(`/api/leaderboard/topic?topic=${topic}`)