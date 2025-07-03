import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState(null);

    const showModal = (component) => setModal(component);
    const closeModal = () => setModal(null);

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}
            {modal &&
                createPortal(
                    <div
                        onClick={closeModal}
                        className="bg-opacity-50 fixed inset-0 z-[999] flex w-full items-center justify-center bg-black/40 backdrop-blur-[2px]"
                    >
                        {modal}
                    </div>,
                    document.body,
                )}
        </ModalContext.Provider>
    );
};
