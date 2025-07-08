import { supabase } from '../lib/supabase'
import { User } from '../types'

export const signUpUser = async (
  email: string, 
  password: string, 
  username: string, 
  playerId: string, 
  uid: string
) => {
  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          player_id: playerId,
          game_uid: uid
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        username,
        role: 'player',
        tokens: 50, // Starting tokens
        player_id: playerId,
        game_uid: uid,
        registered_tournaments: [],
        match_history: []
      })

    if (profileError) throw profileError

    return {
      id: authData.user.id,
      email: authData.user.email!,
      username,
      role: 'player' as const
    }
  } catch (error: any) {
    console.error('Error signing up:', error)
    throw new Error(error.message)
  }
}

export const signInUser = async (email: string, password: string) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to sign in')

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError

    return {
      id: authData.user.id,
      email: authData.user.email!,
      username: profile.username,
      role: profile.role
    }
  } catch (error: any) {
    console.error('Error signing in:', error)
    throw new Error(error.message)
  }
}

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error: any) {
    console.error('Error signing out:', error)
    throw new Error(error.message)
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        callback({
          id: session.user.id,
          email: session.user.email!,
          username: profile.username,
          role: profile.role
        })
      } catch (error) {
        console.error('Error fetching user profile:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}