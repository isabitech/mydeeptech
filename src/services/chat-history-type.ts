export interface UserChatHistoryResponse {
  success: boolean
  message: string
  data: UserChatHistoryResponseData
}

export interface UserChatHistoryResponseData {
  chats: UserChatHistoryResponseDataChat[]
  pagination: Pagination
}

export interface UserChatHistoryResponseDataChat {
  _id: string
  ticketNumber: string
  isChat: boolean
  userId: string
  userModel: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  assignedTo: AssignedTo
  assignedAt: string
  messages: Message[]
  userSatisfactionRating: any
  tags: any[]
  autoCloseAt: any
  firstResponseAt: string
  responseTimeMinutes: number
  attachments: any[]
  lastUpdated: string
  internalNotes: any[]
  createdAt: string
  updatedAt: string
  __v: number
  resolution?: UserChatHistoryResponseDataResolution
}

export interface AssignedTo {
  _id: string
  fullName: string
  email: string
}

export interface Message {
  sender: string
  senderModel: string
  message: string
  isAdminReply: boolean
  timestamp: string
  _id: string
  attachments: any[]
}

export interface UserChatHistoryResponseDataResolution {
  summary: string
  resolvedBy: string
  resolvedAt: string
  resolutionCategory: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalChats: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}
