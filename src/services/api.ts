import axios from 'axios'

export interface User {
  id: number
  name: string
  email: string
}

const api = axios.create({
  baseURL: 'http://localhost:3333',
})

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users')
  return response.data
}

export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
  const response = await api.post<User>('/api/users', data)
  return response.data
}

export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`)
}
