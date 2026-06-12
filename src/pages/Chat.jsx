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
            <svg viewBox="0 0 24 24" style={styles.avatarSvg}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <ellipse
                  key={i}
                  cx="12"
                  cy="12"
                  rx="2"
                  ry="6"
                  fill="white"
                  transform={`rotate(${angle} 12 12)`}
                />
              ))}
              <circle cx="12" cy="12" r="3" fill="#E8C547" />
            </svg>
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {msg.role === "assistant" && (
                <div style={styles.botAvatar}>
                  <svg viewBox="0 0 24 24" style={styles.botAvatarSvg}>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                      <ellipse
                        key={i}
                        cx="12"
                        cy="12"
                        rx="2"
                        ry="5"
                        fill="white"
                        transform={`rotate(${angle} 12 12)`}
                      />
                    ))}
                    <circle cx="12" cy="12" r="2.5" fill="#E8C547" />
                  </svg>
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
                <div style={styles.userAvatar}>U</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              style={styles.typingWrapper}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div style={styles.botAvatar}>
                <svg viewBox="0 0 24 24" style={styles.botAvatarSvg}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <ellipse
                      key={i}
                      cx="12"
                      cy="12"
                      rx="2"
                      ry="5"
                      fill="white"
                      transform={`rotate(${angle} 12 12)`}
                    />
                  ))}
                  <circle cx="12" cy="12" r="2.5" fill="#E8C547" />
                </svg>
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
              opacity: input.trim() ? 1 : 0.4,
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
          40% { transform: translateY(-4px); }
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
    background: "#F8F6F3",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "white",
    borderBottom: "1px solid #E8E4DF",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    background: "#2D5A3D",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSvg: {
    width: "24px",
    height: "24px",
  },
  headerName: {
    margin: 0,
    fontWeight: "600",
    color: "#1A1A1A",
    fontSize: "16px",
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "2px",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#22C55E",
  },
  headerStatus: {
    margin: 0,
    fontSize: "11px",
    color: "#6B7280",
  },
  headerButtons: {
    display: "flex",
    gap: "8px",
  },
  dashBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #E8E4DF",
    background: "white",
    color: "#374151",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  logoutBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#DC2626",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    fontFamily: "inherit",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    maxWidth: "70%",
  },
  botAvatar: {
    width: "28px",
    height: "28px",
    background: "#2D5A3D",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  botAvatarSvg: {
    width: "16px",
    height: "16px",
  },
  userAvatar: {
    width: "28px",
    height: "28px",
    background: "#6B7280",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "11px",
    fontWeight: "600",
    color: "white",
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: "14px",
    fontSize: "14px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  userBubble: {
    background: "#2D5A3D",
    color: "white",
    borderBottomRightRadius: "4px",
    marginLeft: "auto",
  },
  botBubble: {
    background: "white",
    color: "#1A1A1A",
    borderBottomLeftRadius: "4px",
    border: "1px solid #E8E4DF",
  },
  typingWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  typingBubble: {
    background: "white",
    padding: "12px 16px",
    borderRadius: "14px",
    borderBottomLeftRadius: "4px",
    border: "1px solid #E8E4DF",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#9CA3AF",
  },
  inputArea: {
    padding: "12px 20px 16px",
    background: "white",
    borderTop: "1px solid #E8E4DF",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid #E8E4DF",
    background: "#FAFAF8",
    fontSize: "14px",
    color: "#1A1A1A",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "44px",
    maxHeight: "100px",
  },
  sendBtn: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#2D5A3D",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  inputHint: {
    margin: "6px 0 0",
    fontSize: "11px",
    color: "#9CA3AF",
    textAlign: "center",
  },
};
