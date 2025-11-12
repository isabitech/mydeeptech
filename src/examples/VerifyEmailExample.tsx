import { useState } from "react";
import { useVerifyEmail } from "../hooks/Auth/useVerifyEmail";

// Example component showing how to use the useVerifyEmail hook
const VerifyEmailExample = () => {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const { verifyEmail, setupPassword, loading, error, isVerified, userData } = useVerifyEmail();

  const handleVerify = async () => {
    if (!userId || !email) return;

    const result = await verifyEmail(userId, email);
    console.log("Verification result:", result);
  };

  const handlePasswordSetup = async () => {
    const payload = {
      userId: userId,
      email: userData?.email || "test@example.com",
      password: "TestPassword123!",
      confirmPassword: "TestPassword123!"
    };
    
    const result = await setupPassword(payload);
    console.log("Password setup result:", result);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Email Verification Hook Example</h2>
      
      {/* Manual verification test */}
      <div className="mb-4">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleVerify}
          disabled={loading || !userId}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </div>

      {/* Status display */}
      <div className="space-y-2">
        <p>Loading: {loading ? "Yes" : "No"}</p>
        <p>Verified: {isVerified ? "Yes" : "No"}</p>
        {error && <p className="text-red-600">Error: {error}</p>}
        {userData && <p className="text-green-600">Email: {userData.email}</p>}
      </div>

      {/* Password setup test */}
      {isVerified && (
        <div className="mt-4">
          <button
            onClick={handlePasswordSetup}
            disabled={loading}
            className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? "Setting up password..." : "Test Password Setup"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailExample;