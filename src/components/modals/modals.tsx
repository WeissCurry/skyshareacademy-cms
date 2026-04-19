import React from 'react';
import Xbutton from "@images/mascot-icons/Fill 300.png";

function Modal({ isOpen, onClose, showCloseButton = true, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-3xl p-6 relative mx-4">
                {showCloseButton && (
                    <button onClick={onClose} className="absolute top-6 right-6">
                        <img className="w-5" src={Xbutton} alt="Close" />
                    </button>
                )}
                {/* dinamis */}
                {children}
            </div>
        </div>
    );
}

export default Modal;