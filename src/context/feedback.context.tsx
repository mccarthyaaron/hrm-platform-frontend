import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { message, notification } from 'antd';
import type { NotificationInstance } from 'antd/es/notification/interface';
import type { MessageInstance } from 'antd/es/message/interface';

type FeedbackContextValue = {
  messageApi: MessageInstance;
  notificationApi: NotificationInstance;
};

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

type FeedbackProviderProps = {
  children: ReactNode;
};

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  const value = useMemo<FeedbackContextValue>(
    () => ({
      messageApi,
      notificationApi,
    }),
    [messageApi, notificationApi]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {messageContextHolder}
      {notificationContextHolder}
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}
