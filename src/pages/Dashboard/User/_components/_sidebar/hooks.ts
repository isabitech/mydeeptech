import { useState, useMemo } from 'react';
import { MenuItem, UserInfoData } from './types';
import { BASE_MENU_ITEMS, QA_REVIEW_MENU_ITEM, ASSESSMENT_LIST_MENU_ITEM } from './constants';

export const useSidebarLogic = (userInfo: UserInfoData | null) => {
  const [isOpen, setIsOpen] = useState(false);

  // Generate dynamic menu items based on user status
  const getDynamicMenuItems = (): MenuItem[] => {
    if (!userInfo) return BASE_MENU_ITEMS;

    const { qaStatus, annotatorStatus } = userInfo;
    let dynamicItems = [...BASE_MENU_ITEMS];

    // If qaStatus === "approved", add QA Review Dashboard
    if (qaStatus === "approved") {
      const assessmentHistoryIndex = dynamicItems.findIndex(item => item.key === "assessment-history");
      if (assessmentHistoryIndex !== -1) {
        dynamicItems.splice(assessmentHistoryIndex + 1, 0, QA_REVIEW_MENU_ITEM);
      } else {
        dynamicItems.splice(2, 0, QA_REVIEW_MENU_ITEM);
      }
    }

    // If annotatorStatus === "approved", add Assessment List
    if (annotatorStatus === "approved") {
      const lastAssessmentIndex = Math.max(
        dynamicItems.findIndex(item => item.key === "assessment-history"),
        dynamicItems.findIndex(item => item.key === "qa-review")
      );
      if (lastAssessmentIndex !== -1) {
        dynamicItems.splice(lastAssessmentIndex + 1, 0, ASSESSMENT_LIST_MENU_ITEM);
      } else {
        dynamicItems.splice(2, 0, ASSESSMENT_LIST_MENU_ITEM);
      }
    }

    return dynamicItems;
  };

  // Check if a menu item should be locked based on user status
  const isMenuItemLocked = (itemKey: string): boolean => {
    if (!userInfo) {
      return false; // Don't lock anything while loading
    }

    const { annotatorStatus, microTaskerStatus, qaStatus } = userInfo;

    // QA Review and Assessments List are never locked if user has the right status
    if ((itemKey === "qa-review" && qaStatus === "approved") ||
      (itemKey === "assessments-list" && annotatorStatus === "approved")) {
      return false;
    }

    // If both statuses are pending, lock everything except overview, assessment, and settings
    if (annotatorStatus === "pending" && microTaskerStatus === "pending" && qaStatus === "pending") {
      return !["overview", "assessment", "settings"].includes(itemKey);
    }

    // If annotator is submitted and microTasker is pending, lock everything except overview and settings
    if (annotatorStatus === "submitted" && microTaskerStatus === "pending" && qaStatus === "pending") {
      return !["overview", "settings"].includes(itemKey);
    }

    // Default: don't lock anything
    return false;
  };

  // Filter menu items based on user status
  const getFilteredMenuItems = (menuItems: MenuItem[]): MenuItem[] => {
    if (!userInfo) {
      return menuItems; // Show all items while loading
    }

    const { annotatorStatus, microTaskerStatus, qaStatus } = userInfo;

    let filteredItems = [...menuItems];

    // If either status is approved, remove assessment from menu
    if (annotatorStatus === "approved" || microTaskerStatus === "approved") {
      filteredItems = filteredItems.filter(item => item.key !== "assessment");
    }

    // Show assessment history only if user has completed at least one assessment
    // (if either status is not "pending", it means they've taken an assessment)
    if (annotatorStatus === "pending" && microTaskerStatus === "pending" && qaStatus !== "approved") {
      filteredItems = filteredItems.filter(item => item.key !== "assessment-history");
    }

    return filteredItems;
  };

  const allMenuItems = useMemo(() => getDynamicMenuItems(), [userInfo]);
  const filteredMenuItems = useMemo(() => getFilteredMenuItems(allMenuItems), [allMenuItems, userInfo]);

  return {
    isOpen,
    setIsOpen,
    filteredMenuItems,
    isMenuItemLocked,
  };
};