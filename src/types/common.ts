
import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface LayoutProps {
  children: React.ReactNode;
}
