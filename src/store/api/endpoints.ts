export const endpoints = {
  auth: {
    login: "https://my-deep-tech.onrender.com/api/auth/login",
    signup: 'https://my-deep-tech.onrender.com/api/auth/signup',
  },

  // admin
  project : {
    createProject : "https://my-deep-tech.onrender.com/api/auth/createProject",
    getProject: "https://my-deep-tech.onrender.com/api/auth/getProject",
    updateProject: "https://my-deep-tech.onrender.com/api/auth/updateProject",
    deleteProject: "https://my-deep-tech.onrender.com/api/auth/deleteProject"
  },
  tasks:{
    createTask: "https://my-deep-tech.onrender.com/api/auth/createTasks",
    assignTask: "https://my-deep-tech.onrender.com/api/auth/assignTask",
    getAllTasks: "https://my-deep-tech.onrender.com/api/auth/getAllTasks",
  },
  users :{
    getAllUsers: "https://my-deep-tech.onrender.com/api/auth/getAllUsers"
  },
  survey: {
    verifyEmail: "https://deep-tech-survey.onrender.com/api/auth/validateuseremail",
  },
  
};
