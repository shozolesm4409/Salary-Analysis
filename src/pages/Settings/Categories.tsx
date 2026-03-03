import React from 'react';
import SettingsList from './SettingsList';
import { useSettings } from '@/hooks/useSettings';

interface CategoriesProps {
  categories: any[];
  typeFilter: 'all' | 'income' | 'expense' | 'both';
  setTypeFilter: (type: 'all' | 'income' | 'expense' | 'both') => void;
  visibilityFilter: 'all' | 'visible' | 'hidden';
  setVisibilityFilter: (visibility: 'all' | 'visible' | 'hidden') => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, hidden: boolean) => void;
}

export default function Categories(props: CategoriesProps) {
  const { isActionHidden } = useSettings();
  
  return (
    <SettingsList 
      items={props.categories}
      typeFilter={props.typeFilter}
      setTypeFilter={props.setTypeFilter}
      visibilityFilter={props.visibilityFilter}
      setVisibilityFilter={props.setVisibilityFilter}
      onEdit={props.onEdit}
      onDelete={props.onDelete}
      onToggleVisibility={props.onToggleVisibility}
      showActions={!isActionHidden('categories_action')}
    />
  );
}
