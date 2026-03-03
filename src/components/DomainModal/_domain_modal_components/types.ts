export interface DomainWithCategorizationItem {
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  subCategory: {
    _id: string | null;
    name: string;
    slug: string | null;
  };
  domains: {
    _id: string;
    name: string;
    slug: string;
  }[];
  totalDomains: number;
}

export interface TableDataType {
  key: string;
  categoryName: string;
  categoryRowSpan: number;
  subCategoryName: string;
  subCategorySlug: string | null;
  domains: {
    _id: string;
    name: string;
    slug: string;
  }[];
  categoryId: string;
  subCategoryId: string | null;
}

export interface AvailableCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AvailableSubCategory {
  id: string;
  name: string;
  slug: string | null;
}

export interface ModalData {
  id: string;
  name: string;
  categoryId?: string;
  subCategoryId?: string | null;
  description?: string;
  categoryName?: string;
}

export type ModalType = 'edit' | 'delete';
export type ModalEntity = 'category' | 'subcategory' | 'domain';