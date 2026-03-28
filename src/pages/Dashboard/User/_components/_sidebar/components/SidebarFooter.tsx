import { SidebarFooterProps } from "../types";

const SidebarFooter = ({ className = "" }: SidebarFooterProps) => {
  return (
    <div className={`p-4 border-t border-gray-700 text-sm ${className}`}>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-center space-x-3 text-xs">
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#F6921E] transition-colors"
          >
            Privacy
          </a>
          <span className="text-gray-600">|</span>
          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#F6921E] transition-colors"
          >
            Terms
          </a>
        </div>
        <div className="text-center text-gray-500">
          © {new Date().getFullYear()} My Deep Tech
        </div>
      </div>
    </div>
  );
};

export default SidebarFooter;