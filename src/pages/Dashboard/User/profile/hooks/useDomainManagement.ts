import { useState } from "react";
import { notification } from "antd";
import domainQueryService from "../../../../../services/domain-service/domain-query";
import domainMutation from "../../../../../services/domain-service/domain-mutation";
import { Profile } from "../../../../../validators/profile/profile-schema";

export const useDomainManagement = (profile: Profile | null | undefined) => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const assignDomainsMutation = domainMutation.useAssignDomainsToUser();
  const removeDomainMutation = domainMutation.useRemoveDomainFromUser();

  // Fetch domains with high limit to get all available options
  const {data: domainsData, isLoading: domainsLoading, error: domainsError} = domainQueryService.useDomains({ limit: 1000 });

  const allDomains = domainsData?.data?.domain || [];
  const mergedDomains = allDomains;

  // Use userDomains from profile data instead of separate API call
  // Fallback to legacy domains field if userDomains is not available
  const profileUserDomains = profile?.userDomains || [];
  const legacyDomains = profile?.domains || [];

  // Normalize string domains to ObjectIds if possible (for legacy domains)
  const normalizeDomainId = (d: any) => {
    let rawId = typeof d === "string" ? d : d?.domain_child?._id || d?.domain?._id || d?._id;
    if (typeof rawId === "string" && !/^[0-9a-fA-F]{24}$/.test(rawId)) {
      const match = mergedDomains.find((m: any) => m.name === rawId);
      if (match) return match._id;
    }
    return rawId;
  };

  // Build map of assigned domains, prioritizing userDomains from profile
  const assignedDomainsMap = new Map();

  // Add userDomains first (these are the new structured domains)
  profileUserDomains.forEach((userDomain: any) => {
    const domainId = userDomain._id;
    if (domainId && !assignedDomainsMap.has(domainId)) {
      assignedDomainsMap.set(domainId, {
        domain: userDomain,
        id: userDomain.assignmentId, // Use assignment ID for removal
        domainId: domainId
      });
    }
  });

  // Add legacy domains if userDomains is empty (for fallback compatibility)
  if (profileUserDomains.length === 0) {
    legacyDomains.forEach((d: string | { _id: string; name: string }) => {
      const normId = normalizeDomainId(d);
      if (normId && !assignedDomainsMap.has(normId)) {
        const fullDomain = mergedDomains.find((m) => m._id === normId);
        assignedDomainsMap.set(normId, {
          domain: fullDomain || (typeof d === "object" ? d : { _id: normId, name: d }),
          id: null, // Legacy domains don't have assignment IDs
          domainId: normId
        });
      }
    });
  }

  const assignedDomains = Array.from(assignedDomainsMap.values());

  const handleDomainsChange = (values: string[]) => {
    setSelectedDomains(values);
  };

  const handleSaveDomains = async () => {
    try {
      const initiallySelectedIds = assignedDomains.map(d => d.domainId);

      // Domains to remove (ones that were in assignedDomains but not in selectedDomains)
      const toRemove = assignedDomains.filter(d =>
        d.id && !selectedDomains.includes(d.domainId)
      );

      // Domains to add (ones that are in selectedDomains but weren't in assignedDomains)
      // Remove duplicates and ensure valid ObjectIds
      const toAdd = [...new Set(selectedDomains)]
        .filter(id => 
          !initiallySelectedIds.includes(id) && 
          /^[0-9a-fA-F]{24}$/.test(id)
        );

      console.log("🎯 Domain management:", {
        initiallySelected: initiallySelectedIds,
        currentlySelected: selectedDomains,
        toAdd: toAdd,
        toRemove: toRemove.map(r => ({ id: r.id, domainId: r.domainId }))
      });

      const promises = [];

      // Remove deselected domains
      for (const assignment of toRemove) {
        promises.push(removeDomainMutation.mutateAsync(assignment.id));
      }

      // Add newly selected domains (only if there are any to add)
      if (toAdd.length > 0) {
        promises.push(assignDomainsMutation.mutateAsync(toAdd));
      }

      if (promises.length === 0) return;

      await Promise.all(promises);

      notification.success({
        message: "Domains Updated",
        description: "Your domain preferences have been successfully updated.",
      });

      // Domain data will be updated through profile refetch in parent component
    } catch (error) {
      console.error("Failed to update domains:", error);
      throw error;
    }
  };

  const initializeSelectedDomains = () => {
    if (assignedDomains) {
      const existingIds = assignedDomains.map((d: any) => d.domainId);
      setSelectedDomains([...new Set(existingIds)]);
    }
  };

  return {
    selectedDomains,
    setSelectedDomains,
    assignedDomains,
    mergedDomains,
    handleDomainsChange,
    handleSaveDomains,
    initializeSelectedDomains,
    domainsLoading,
    domainsError
  };
};