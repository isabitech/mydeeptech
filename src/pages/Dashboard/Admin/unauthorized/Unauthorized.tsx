import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { useAdminSession } from "../../../../queries/auth.query";
import { getDefaultRedirectPath } from "../../../../utils/permissions";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { permissions, roleName } = useAdminSession();

  const handleBack = () => {
    // Navigate back in history. 
    // Since PageGuard uses { replace: true }, this will skip the 'bad' route.
    navigate(-1);
    
    // Fallback: If no history, use the smart redirect logic
    setTimeout(() => {
        if (window.location.pathname === "/unauthorized") {
            const target = getDefaultRedirectPath(permissions, roleName);
            navigate(target, { replace: true });
        }
    }, 500);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={handleBack}>
            Go Back
          </Button>
        }
      />
    </div>
  );
};

export default Unauthorized;
