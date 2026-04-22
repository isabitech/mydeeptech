import { useState, useCallback } from "react";
import { QAUserSchema, AnnotatorUser } from "../../../../../validators/annotators/annotators-schema";

export const useAnnotatorModals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedAnnotator, setSelectedAnnotator] = useState<AnnotatorUser | QAUserSchema | null>(null);

  const handleViewDetails = useCallback((annotator: AnnotatorUser | QAUserSchema) => {
    setSelectedAnnotator(annotator);
    setIsModalOpen(true);
  }, []);

  const handleViewResult = useCallback((annotator: AnnotatorUser | QAUserSchema) => {
    setSelectedAnnotator(annotator);
    setIsResultModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAnnotator(null);
  }, []);

  const handleCloseResultModal = useCallback(() => {
    setIsResultModalOpen(false);
    setSelectedAnnotator(null);
  }, []);

  const closeAllModals = useCallback(() => {
    setIsModalOpen(false);
    setIsResultModalOpen(false);
    setSelectedAnnotator(null);
  }, []);

  return {
    // State
    isModalOpen,
    isResultModalOpen,
    selectedAnnotator,
    
    // Actions
    handleViewDetails,
    handleViewResult,
    handleCloseModal,
    handleCloseResultModal,
    closeAllModals,

    // Direct setters if needed
    setIsModalOpen,
    setIsResultModalOpen,
    setSelectedAnnotator
  };
};