// import { useMutation } from "@tanstack/react-query";
// import  { AxiosError, AxiosResponse } from "axios";
// import { endpoints } from "../../store/api/endpoints";


// export type SignupRequestType = {
//   firstname: string;
//   lastname: string;
//   email: string;
//   password: string;
//   username: string;
//   phone: string;

// };
// export interface User {
//   firstname: string
//   lastname: string
//   email: string
//   consent: string
//   password: string
//   role: string
//   verified: boolean
//   _id: string
//   createdAt: string
//   updatedAt: string
//   __v: number
// }

// export interface Data {
//   user: User
// }

// export type SignupResponseType =  {
//   data: Data
//   responseMessage: string
//   responseCode: number
// }

// const SignUp = async (
//   input: SignupRequestType
// ): Promise<AxiosResponse<any>> => {
//   const response = await axiosInstance.post(endpoints.auth.signup, input);
//   return response;
// };

// export const useSignUp = () => {
//   return useMutation<AxiosResponse<any>, AxiosError, SignupRequestType>({
//     mutationFn: (input: SignupRequestType) => SignUp(input),
//     onSuccess: () => {},
//     onError: () => {},
//   });
// };


