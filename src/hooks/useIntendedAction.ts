const STORAGE_KEY = 'intended_action';

export interface IntendedAction {
  type: 'live_view' | 'tour';
  page: string;
  propertyId: number;
  propertyTitle: string;
}

export const useIntendedAction = () => {
  const saveAction = (action: IntendedAction) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
  };

  const getAction = (): IntendedAction | null => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as IntendedAction;
    } catch {
      return null;
    }
  };

  const clearAction = () => {
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return { saveAction, getAction, clearAction };
};
