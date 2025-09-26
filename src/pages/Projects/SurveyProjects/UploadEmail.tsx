import { useState } from "react";
import { baseURL, endpoints } from "../../../store/api/endpoints";

const UploadEmail = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;

    const text = await file.text();
    const parsedEmails = text
      .split(/[\n,]+/)
      .map((email: string) => email.trim())
      .filter((email: string) => email && /\S+@\S+\.\S+/.test(email));

    setEmails(parsedEmails);
  };

  const handleUpload = async () => {
    if (emails.length === 0) {
      setMessage("No valid emails found.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const res = await fetch(`${baseURL}${endpoints.addBulkEmails}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (res.ok) {
        setMessage("✅ Emails uploaded successfully.");
        setEmails([]);
      } else {
        setMessage("❌ Failed to upload emails.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error uploading emails.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">📤 Upload Bulk Emails</h2>

      <input
        type="file"
        accept=".txt,.csv"
        onChange={handleFileChange}
        className="mb-4 block w-full"
      />

      {emails.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          {emails.length} valid email(s) loaded
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || emails.length === 0}
        className="bg-blue-600 text-secondary px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 border "
      >
        {uploading ? "Uploading..." : "Upload Emails"}
      </button>

      {message && (
        <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default UploadEmail;
