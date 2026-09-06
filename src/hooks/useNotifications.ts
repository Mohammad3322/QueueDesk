import { useContext } from "react";
import {
  NotificationsContext,
} from "../features/notifications/context";
import type { NotificationsContextType } from "../types";

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};
