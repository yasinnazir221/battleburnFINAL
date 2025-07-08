import { supabase } from '../lib/supabase'
import { Tournament, Player, PaymentRequest } from '../types'

// Get all players
export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'player')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.username,
      tokens: user.tokens,
      playerId: user.player_id,
      gameUid: user.game_uid,
      uid: user.game_uid,
      registeredTournaments: user.registered_tournaments || [],
      matchHistory: user.match_history || [],
      createdAt: user.created_at
    }))
  } catch (error) {
    console.error('Error getting players:', error)
    return []
  }
}

// Get all tournaments
export const getAllTournaments = async (): Promise<Tournament[]> => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(tournament => ({
      id: tournament.id,
      title: tournament.title,
      description: tournament.description,
      mode: tournament.mode,
      entryFee: tournament.entry_fee,
      killReward: tournament.kill_reward,
      booyahReward: tournament.booyah_reward,
      dateTime: tournament.date_time,
      status: tournament.status,
      maxPlayers: tournament.max_players,
      currentPlayers: tournament.current_players,
      participants: tournament.participants || [],
      matches: tournament.matches || [],
      roomId: tournament.room_id || '',
      roomPassword: tournament.room_password || '',
      rules: tournament.rules || [],
      winner: tournament.winner,
      results: tournament.results || [],
      createdAt: tournament.created_at
    }))
  } catch (error) {
    console.error('Error getting tournaments:', error)
    return []
  }
}

// Create tournament
export const createTournament = async (tournament: Omit<Tournament, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        title: tournament.title,
        description: tournament.description,
        mode: tournament.mode,
        entry_fee: tournament.entryFee,
        kill_reward: tournament.killReward,
        booyah_reward: tournament.booyahReward,
        date_time: tournament.dateTime,
        status: tournament.status,
        max_players: tournament.maxPlayers,
        current_players: tournament.currentPlayers,
        participants: tournament.participants,
        matches: tournament.matches,
        room_id: tournament.roomId,
        room_password: tournament.roomPassword,
        rules: tournament.rules
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error creating tournament:', error)
    throw error
  }
}

// Update tournament
export const updateTournament = async (id: string, updates: Partial<Tournament>) => {
  try {
    const updateData: any = {}
    
    if (updates.title) updateData.title = updates.title
    if (updates.description) updateData.description = updates.description
    if (updates.mode) updateData.mode = updates.mode
    if (updates.entryFee !== undefined) updateData.entry_fee = updates.entryFee
    if (updates.killReward !== undefined) updateData.kill_reward = updates.killReward
    if (updates.booyahReward !== undefined) updateData.booyah_reward = updates.booyahReward
    if (updates.dateTime) updateData.date_time = updates.dateTime
    if (updates.status) updateData.status = updates.status
    if (updates.maxPlayers !== undefined) updateData.max_players = updates.maxPlayers
    if (updates.currentPlayers !== undefined) updateData.current_players = updates.currentPlayers
    if (updates.participants) updateData.participants = updates.participants
    if (updates.matches) updateData.matches = updates.matches
    if (updates.roomId !== undefined) updateData.room_id = updates.roomId
    if (updates.roomPassword !== undefined) updateData.room_password = updates.roomPassword
    if (updates.rules) updateData.rules = updates.rules
    if (updates.winner !== undefined) updateData.winner = updates.winner
    if (updates.results) updateData.results = updates.results

    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating tournament:', error)
    throw error
  }
}

// Update player tokens
export const updatePlayerTokens = async (
  playerId: string, 
  amount: number, 
  reason: string, 
  adminId?: string
) => {
  try {
    // Get current tokens
    const { data: player, error: playerError } = await supabase
      .from('users')
      .select('tokens')
      .eq('id', playerId)
      .single()

    if (playerError) throw playerError

    const newTokens = player.tokens + amount

    // Update player tokens
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        tokens: newTokens,
        updated_at: new Date().toISOString()
      })
      .eq('id', playerId)

    if (updateError) throw updateError

    // Log transaction
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        player_id: playerId,
        amount,
        type: amount > 0 ? 'deposit' : 'withdrawal',
        reason,
        admin_id: adminId
      })

    if (transactionError) throw transactionError
  } catch (error) {
    console.error('Error updating player tokens:', error)
    throw error
  }
}

// Get payment requests
export const getPaymentRequests = async (): Promise<PaymentRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) throw error

    return data.map(request => ({
      id: request.id,
      userId: request.user_id,
      userEmail: request.user_email,
      username: request.username,
      amount: request.amount,
      screenshotURL: request.screenshot_url,
      screenshotPath: request.screenshot_path,
      status: request.status,
      submittedAt: request.submitted_at,
      processedAt: request.processed_at,
      method: request.method,
      rejectionReason: request.rejection_reason
    }))
  } catch (error) {
    console.error('Error getting payment requests:', error)
    return []
  }
}

// Create payment request
export const createPaymentRequest = async (request: Omit<PaymentRequest, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: request.userId,
        user_email: request.userEmail,
        username: request.username,
        amount: request.amount,
        screenshot_url: request.screenshotURL,
        screenshot_path: request.screenshotPath,
        status: request.status,
        method: request.method
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error creating payment request:', error)
    throw error
  }
}

// Update payment request
export const updatePaymentRequest = async (
  id: string, 
  updates: { status: 'approved' | 'rejected'; rejectionReason?: string }
) => {
  try {
    const { error } = await supabase
      .from('payment_requests')
      .update({
        status: updates.status,
        processed_at: new Date().toISOString(),
        rejection_reason: updates.rejectionReason
      })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating payment request:', error)
    throw error
  }
}

// Real-time subscriptions
export const listenToPlayers = (callback: (players: Player[]) => void) => {
  return supabase
    .channel('users_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users', filter: 'role=eq.player' },
      () => {
        getAllPlayers().then(callback)
      }
    )
    .subscribe()
}

export const listenToTournaments = (callback: (tournaments: Tournament[]) => void) => {
  return supabase
    .channel('tournaments_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tournaments' },
      () => {
        getAllTournaments().then(callback)
      }
    )
    .subscribe()
}

export const listenToPaymentRequests = (callback: (requests: PaymentRequest[]) => void) => {
  return supabase
    .channel('payment_requests_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'payment_requests' },
      () => {
        getPaymentRequests().then(callback)
      }
    )
    .subscribe()
}