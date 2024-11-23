// import CryptoJS from "crypto-js";

// export class Encryption {
//   static encrypt(value: any): string {
//     return CryptoJS.AES.encrypt(
//       JSON.stringify(value),
//       process.env.NEXT_PUBLIC_SECRET_KEY as string
//     ).toString();
//   }

//   static decrypt(value: string): string {
//     return CryptoJS.AES.decrypt(
//       value,
//       process.env.NEXT_PUBLIC_SECRET_KEY as string
//     ).toString(CryptoJS.enc.Utf8);
//   }
// }