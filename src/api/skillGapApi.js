import api from './axios'

export const getRoles = () =>
  api.get('/api/skillgap/roles')

// encodeURIComponent handles spaces in role names
export const analyzeSkillGap = (role) =>
  api.post(`/api/skillgap/analyze?targetRole=${encodeURIComponent(role)}`)
