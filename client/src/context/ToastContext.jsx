import { createContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export const ToastContext = createContext();

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((msg, type = "info") => {
        const id = ++toastIdCounter;
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);

    const getIcon = (type) => {
        switch (type) {
            case "success": return <CheckCircle size={18} style={{ color: "var(--seat-reserved)" }} />;
            case "error": return <AlertCircle size={18} style={{ color: "#ef4444" }} />;
            default: return <Info size={18} style={{ color: "var(--accent)" }} />;
        }
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`} style={{
                        minWidth: "300px",
                        justifyContent: "space-between"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {getIcon(t.type)}
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{t.msg}</span>
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--text-muted)",
                                display: "flex",
                                padding: "4px"
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
