// Example component showing how to use the updated UserContext

import { useUserContext } from "../UserContext";

const UserProfileExample = () => {
  const { userInfo } = useUserContext();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Full Name:</label>
          <p>{userInfo.fullName}</p>
        </div>
        
        <div>
          <label className="font-semibold">Email:</label>
          <p>{userInfo.email}</p>
        </div>
        
        <div>
          <label className="font-semibold">Phone:</label>
          <p>{userInfo.phone}</p>
        </div>
        
        <div>
          <label className="font-semibold">Email Verified:</label>
          <p>{userInfo.isEmailVerified ? "✅ Yes" : "❌ No"}</p>
        </div>
        
        <div>
          <label className="font-semibold">Password Set:</label>
          <p>{userInfo.hasSetPassword ? "✅ Yes" : "❌ No"}</p>
        </div>
        
        <div>
          <label className="font-semibold">Annotator Status:</label>
          <p className={`px-2 py-1 rounded ${
            userInfo.annotatorStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            userInfo.annotatorStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {userInfo.annotatorStatus || 'Not Set'}
          </p>
        </div>
        
        <div>
          <label className="font-semibold">Micro Tasker Status:</label>
          <p className={`px-2 py-1 rounded ${
            userInfo.microTaskerStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            userInfo.microTaskerStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {userInfo.microTaskerStatus || 'Not Set'}
          </p>
        </div>
      </div>
      
      {userInfo.domains.length > 0 && (
        <div className="mt-4">
          <label className="font-semibold">Domains:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {userInfo.domains.map((domain, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {userInfo.socialsFollowed.length > 0 && (
        <div className="mt-4">
          <label className="font-semibold">Social Media Followed:</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {userInfo.socialsFollowed.map((social, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {social}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileExample;