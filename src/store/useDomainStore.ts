import { create } from "zustand";
import { useShallow } from "zustand/shallow";

type DomainStates = {
  activeTab: string;
  openDomainModal: boolean;
};

type DomainActions = {
  setActiveTab: (activeTab: string) => void;

  onCancel: () => void;
  onSuccess?: () => void;
  setOpenDomainModal: (openDomainModal: boolean) => void;
};

type DomainStore = DomainStates & DomainActions;

const initialStates: DomainStates = {
  activeTab: "1",
  openDomainModal: false,
};

const useDomainStore = create<DomainStore>((set) => ({
  ...initialStates,
  // --- Actions ---
    setActiveTab: (activeTab) => set({ activeTab }),
    setOpenDomainModal: (openDomainModal) => set({ openDomainModal }),
    onCancel: () => set({ activeTab: "1", openDomainModal: false }),
    onSuccess: () => set({ activeTab: "1", openDomainModal: false }),
}));


const useDomainActions = () => {
return  useDomainStore(
    useShallow((state) => ({
        setActiveTab: state.setActiveTab,
        onCancel: state.onCancel,
        onSuccess: state.onSuccess,
        setOpenDomainModal: state.setOpenDomainModal,
    }))
)}

const useDomainStates = () => {
return  useDomainStore(
    useShallow((state) => ({
        activeTab: state.activeTab,
        openDomainModal: state.openDomainModal,
    }))
)}


export { useDomainStates, useDomainActions, useDomainStore };
export type { DomainStore, DomainStates, DomainActions };