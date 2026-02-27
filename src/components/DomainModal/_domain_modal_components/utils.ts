import type { DomainWithCategorizationItem, TableDataType, AvailableCategory, AvailableSubCategory } from "./types";

export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const processTableData = (domainsData: DomainWithCategorizationItem[] | undefined): TableDataType[] => {
  if (!domainsData) {
    return [];
  }

  // Group by category to calculate rowSpans
  const categoryGroups: { [categoryId: string]: DomainWithCategorizationItem[] } = {};
  
  domainsData.forEach(item => {
    const categoryId = item.category._id;
    if (!categoryGroups[categoryId]) {
      categoryGroups[categoryId] = [];
    }
    categoryGroups[categoryId].push(item);
  });

  // Flatten data for table display with proper rowSpan calculation
  const flattenedData: TableDataType[] = [];
  
  Object.values(categoryGroups).forEach(categoryItems => {
    categoryItems.forEach((item, index) => {
      flattenedData.push({
        key: `${item.category._id}-${item.subCategory._id || 'no-sub'}-${index}`,
        categoryName: index === 0 ? item.category.name : '',
        categoryRowSpan: index === 0 ? categoryItems.length : 0,
        subCategoryName: item.subCategory.name,
        subCategorySlug: item.subCategory.slug,
        domains: item.domains,
        categoryId: item.category._id,
        subCategoryId: item.subCategory._id,
      });
    });
  });

  return flattenedData;
};

export const getAvailableCategories = (domainsData: DomainWithCategorizationItem[] | undefined): AvailableCategory[] => {
  if (!domainsData) return [];
  
  const categoryMap = new Map();
  domainsData.forEach((item: DomainWithCategorizationItem) => {
    if (!categoryMap.has(item.category._id)) {
      categoryMap.set(item.category._id, {
        id: item.category._id,
        name: item.category.name,
        slug: item.category.slug
      });
    }
  });
  
  return Array.from(categoryMap.values());
};

export const getSubCategoriesForCategory = (categoryId: string, domainsData: DomainWithCategorizationItem[] | undefined): AvailableSubCategory[] => {
  if (!domainsData) return [];
  
  const subCategoryMap = new Map();
  domainsData.forEach((item: DomainWithCategorizationItem) => {
    if (item.category._id === categoryId && item.subCategory._id) {
      if (!subCategoryMap.has(item.subCategory._id)) {
        subCategoryMap.set(item.subCategory._id, {
          id: item.subCategory._id,
          name: item.subCategory.name,
          slug: item.subCategory.slug
        });
      }
    }
  });
  
  return Array.from(subCategoryMap.values());
};

export const getDomainsForCategoryAndSubCategory = (categoryId: string, subCategoryId: string, domainsData: DomainWithCategorizationItem[] | undefined): any[] => {
  if (!domainsData) return [];
  
  const domainsFound = domainsData.find(
    (item: DomainWithCategorizationItem) => 
      item.category._id === categoryId && item.subCategory._id === subCategoryId
  );
  
  return domainsFound?.domains || [];
};