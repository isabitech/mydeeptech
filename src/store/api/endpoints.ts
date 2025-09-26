
export const baseURL = import.meta.env.VITE_API_URL
export const endpoints = {

  auth: {
    login: "/auth/login",
    signup: '/auth/signup',
  },

  // admin
  project : {
    createProject : "/auth/createProject",
    getProject: "/auth/getProject",
    updateProject: "/auth/updateProject",
    deleteProject: "/auth/deleteProject"
  },
  tasks:{
    createTask: "/auth/createTasks",
    assignTask: "/auth/assignTask",
    getAllTasks: "/auth/getAllTasks",
  },
  users :{
    getAllUsers: "/auth/getAllUsers"
  },
  survey: {
    verifyEmail: "auth/validateuseremail",
  },
  addBulkEmails: "auth/addbulkemails",
  
};
