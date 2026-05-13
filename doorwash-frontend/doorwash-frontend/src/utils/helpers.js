import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'EEEE, d MMMM yyyy');
export const formatDateTime = (date) => format(new Date(date), 'd MMM yyyy, h:mm a');
export const formatShortDate = (date) => format(new Date(date), 'd MMM');
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const truncate = (str, n = 60) => str?.length > n ? `${str.slice(0, n)}…` : str;

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const getInitials = (name) => name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) || '?';
