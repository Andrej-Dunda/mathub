export interface iUserHabits {
  id: number,
  user_id: number,
  habit_id: number,
  habit_frequency: string
}

export interface iHabit {
  id: number,
  name: string,
  type: string,
  description: string
}