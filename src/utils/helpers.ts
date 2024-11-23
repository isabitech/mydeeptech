// import { ACCESS_TOKEN_KEYWORD, USER_INFORMATION } from "./constants";
// // import { Encryption } from "./encryption";

// export const RESPONSE_CODE = {
//   successful: 200,
//   badRequest: 400,
//   noData: 201,
//   internalServerError: 500,
//   dataDuplication: 230,
//   unAuthorized: 401,
//   invalidToken: 403,
// };

// // export const retrieveUserInfoFromStorage = () => {
// //   "use client";
// //   if (typeof window === "undefined") {
// //     return { userDetails: null };
// //   }
// //   const encryptedUserInfo = sessionStorage.getItem(USER_INFORMATION);
// //   if (!encryptedUserInfo || encryptedUserInfo.length === 0) {
// //     return { userDetails: null };
// //   }

// //   try {
// //     const decryptedData = Encryption.decrypt(encryptedUserInfo);
// //     if (decryptedData && decryptedData.length > 0) {
// //       const userDetails = JSON.parse(decryptedData);
// //       return userDetails;
// //     }
// //   } catch (error) {
// //     console.error("Error retrieving user info:", error);
// //   }

// //   return { userDetails: null }; // Return null if parsing or decryption fails
// // };

// export const retrieveTokenFromStorage = () => {
//   "use client";

//   if (typeof window === "undefined") {
//     return null;
//   }

//   const token: string =
//     sessionStorage.getItem(ACCESS_TOKEN_KEYWORD as string) &&
//     sessionStorage.getItem(ACCESS_TOKEN_KEYWORD as string)?.length &&
//     JSON.parse(
//       Encryption.decrypt(
//         sessionStorage.getItem(ACCESS_TOKEN_KEYWORD as string) as string
//       )
//     );

//   return token;
// };
