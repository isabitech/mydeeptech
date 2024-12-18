export const endpoints = {
  auth: {
    login: "https://my-deep-tech.onrender.com/api/auth/login",
    signup: 'https://my-deep-tech.onrender.com/api/auth/signup',
  },

  // admin
  project : {
    createProject : "https://my-deep-tech.onrender.com/api/auth/createProject",
    getProject: "https://my-deep-tech.onrender.com/api/auth/getProject"
  },
  tasks:{
    createTask: "https://my-deep-tech.onrender.com/api/auth/createTasks",
    assignTask: "https://my-deep-tech.onrender.com/api/auth/assignTask"
  }
};
