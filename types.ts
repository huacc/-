import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string;
}

// Common props for layout components
export interface LayoutProps {
  children: React.ReactNode;
}