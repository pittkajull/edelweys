import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history,
          user_id: userId,
        }),
      });

      const data = await res.json();
      setIsTyping(false);
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Aduh, Edelweys lagi error nih. Coba lagi ya!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  // Format message with line breaks
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            <div style={styles.avatarIcon}>E</div>
          </div>
          <div>
            <p style={styles.headerName}>Edelweys</p>
            <div style={styles.statusContainer}>
              <div style={styles.statusDot} />
              <p style={styles.headerStatus}>Online</p>
            </div>
          </div>
        </div>
        <div style={styles.headerButtons}>
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.dashBtn}
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "assistant" && (
                <div style={styles.botAvatar}>
                  <div style={styles.botAvatarIcon}>E</div>
                </div>
              )}
              <div
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
                }}
              >
                {formatMessage(msg.content)}
              </div>
              {msg.role === "user" && (
                <div style={styles.userAvatar}>
                  <div style={styles.userAvatarIcon}>U</div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              style={styles.typingWrapper}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div style={styles.botAvatar}>
                <div style={styles.botAvatarIcon}>E</div>
              </div>
              <div style={styles.typingBubble}>
                <div style={styles.typingDots}>
                  <div style={styles.dot} className="bounce1" />
                  <div style={styles.dot} className="bounce2" />
                  <div style={styles.dot} className="bounce3" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <div style={styles.inputContainer}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesanmu di sini..."
            style={styles.textarea}
            rows={1}
          />
          <button
            onClick={sendMessage}
            style={{
              ...styles.sendBtn,
              opacity: input.trim() ? 1 : 0.5,
            }}
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Kirim"}
          </button>
        </div>
        <p style={styles.inputHint}>Tekan Enter untuk kirim</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .bounce1 { animation: bounce 1.2s infinite 0s; }
        .bounce2 { animation: bounce 1.2s infinite 0.2s; }
        .bounce3 { animation: bounce 1.2s infinite 0.4s; }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    background: "white",
    borderBottom: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: "20px",
    fontWeight: "900",
    color: "white",
  },
  headerName: {
    margin: 0,
    fontWeight: "700",
    color: "#1f2937",
    fontSize: "18px",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "2px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },
  headerStatus: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280",
  },
  headerButtons: {
    display: "flex",
    gap: "8px",
  },
  dashBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "white",
    color: "#374151",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  logoutBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    maxWidth: "80%",
  },
  botAvatar: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  botAvatarIcon: {
    fontSize: "12px",
    fontWeight: "900",
    color: "white",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userAvatarIcon: {
    fontSize: "12px",
    fontWeight: "900",
    color: "white",
  },
  bubble: {
    padding: "14px 18px",
    borderRadius: "18px",
    fontSize: "15px",
    lineHeight: "1.6",
    wordBreak: "break-word",
  },
  userBubble: {
    background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    color: "white",
    borderBottomRightRadius: "4px",
    marginLeft: "auto",
  },
  botBubble: {
    background: "white",
    color: "#1f2937",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #f3f4f6",
  },
  typingWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
  },
  typingBubble: {
    background: "white",
    padding: "14px 18px",
    borderRadius: "18px",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #f3f4f6",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#d1d5db",
  },
  inputArea: {
    padding: "16px 24px 20px",
    background: "white",
    borderTop: "1px solid #f3f4f6",
  },
  inputContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: "15px",
    color: "#1f2937",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "48px",
    maxHeight: "120px",
    transition: "border-color 0.2s",
  },
  sendBtn: {
    padding: "14px 24px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  inputHint: {
    margin: "8px 0 0",
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center",
  },
};
