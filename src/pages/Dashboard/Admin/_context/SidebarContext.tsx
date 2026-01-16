import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    handleCloseSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SidebarProvider = ({ children }: { children: React.ReactNode }) => {

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed((prevState) => !prevState);
    };

    const handleCloseSidebar = () => {
        setSidebarCollapsed(false);
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 250) {
                setSidebarCollapsed(false);
            }
        };

        window.addEventListener("resize", handleResize);

        // Initial check
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return <SidebarContext.Provider value={{ toggleSidebar, sidebarCollapsed, handleCloseSidebar }}>
        {children}
    </SidebarContext.Provider>;
}

const useSidebarContext = () => {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebarContext must be used within a SidebarProvider");
    }
    return context;
}

export { SidebarProvider, useSidebarContext, SidebarContext };