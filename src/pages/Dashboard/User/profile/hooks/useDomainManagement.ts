import { useState } from "react";
import { notification } from "antd";
import domainQueryService from "../../../../../services/domain-service/domain-query";
import domainMutation from "../../../../../services/domain-service/domain-mutation";

export const useDomainManagement = (profile: any) => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  const assignDomainsMutation = domainMutation.useAssignDomainsToUser();
  const removeDomainMutation = domainMutation.useRemoveDomainFromUser();

  // Fetch domains with high limit to get all available options
  const {
    data: domainsData,
    isLoading: domainsLoading,
    error: domainsError,
  } = domainQueryService.useDomains({ limit: 1000 });

  const allDomains = domainsData?.data?.domain || [];
  const mergedDomains = allDomains;

  // Fetch user's assigned domains
  const { data: userDomainsData, refetch: refetchUserDomains } = domainQueryService.useUserDomains();

  // Normalize string domains to ObjectIds if possible
  const normalizeDomainId = (d: any) => {
    let rawId = typeof d === "string" ? d : d?.domain_child?._id || d?.domain?._id || d?._id;
    if (typeof rawId === "string" && !/^[0-9a-fA-F]{24}$/.test(rawId)) {
      const match = mergedDomains.find((m: any) => m.name === rawId);
      if (match) return match._id;
    }
    return rawId;
  };

  // Build map of assigned domains, prioritizing real assignments from backendUserDomains
  const assignedDomainsMap = new Map();
  const backendUserDomains = userDomainsData?.data || [];
  const profileUserDomains = profile?.domains || [];

  // Add backend assignments first (these have assignment IDs)
  backendUserDomains.forEach((d: any) => {
    const domainId = d?.domain?._id || d?.domain_child?._id || d?._id;
    if (domainId && !assignedDomainsMap.has(domainId)) {
      // Find full domain info from mergedDomains for better display
      const fullDomain = mergedDomains.find((m: any) => m._id === domainId);
      
      assignedDomainsMap.set(domainId, {
        ...d,
        domain: fullDomain || d.domain || d.domain_child || { _id: domainId },
        id: d._id, // Store assignment ID
        domainId: domainId // Store domain ID for keying
      });
    }
  });

  // Add optional profile domains if not already present
  profileUserDomains.forEach((d: any) => {
    const normId = normalizeDomainId(d);
    if (normId && !assignedDomainsMap.has(normId)) {
      const fullDomain = mergedDomains.find((m: any) => m._id === normId);
      
      assignedDomainsMap.set(normId, {
        domain: fullDomain || (typeof d === "object" ? d : { _id: normId, name: d }),
        id: null, // Legacy domains don't have assignment IDs
        domainId: normId
      });
    }
  });

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
      const toAdd = selectedDomains.filter(id =>
        !initiallySelectedIds.includes(id) && /^[0-9a-fA-F]{24}$/.test(id)
      );

      const promises = [];

      // Remove deselected domains
      for (const assignment of toRemove) {
        promises.push(removeDomainMutation.mutateAsync(assignment.id));
      }

      // Add newly selected domains
      if (toAdd.length > 0) {
        promises.push(assignDomainsMutation.mutateAsync(toAdd));
      }

      if (promises.length === 0) return;

      await Promise.all(promises);

      notification.success({
        message: "Domains Updated",
        description: "Your domain preferences have been successfully updated.",
      });

      // Invaliding queries is already handled by mutation onSuccess, but we can refetch manually too
      refetchUserDomains();
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