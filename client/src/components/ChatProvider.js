import { createContext, useContext } from 'react';

const chatContext = createContext();

export const useChatContext = () => {
    return useContext(chatContext);
};

export const ChatProvider = ({ children, user }) => {
    return (
        <chatContext.Provider value={{ user }}>
            {children}
        </chatContext.Provider>
    );
};
