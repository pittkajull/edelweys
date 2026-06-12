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

  // Floating shapes
  const shapes = [
    { size: 250, x: -60, y: "15%", opacity: 0.1 },
    { size: 200, x: "85%", y: "55%", opacity: 0.08 },
    { size: 150, x: "70%", y: "10%", opacity: 0.06 },
    { size: 180, x: "20%", y: "75%", opacity: 0.07 },
  ];

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.bgContainer}>
        {shapes.map((shape, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.floatingShape,
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
              opacity: shape.opacity,
            }}
            animate={{
              y: [0, -15, 0, 15, 0],
              x: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>E</span>
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
      </motion.div>

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
                  <span style={styles.botAvatarText}>E</span>
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
                  <span style={styles.userAvatarText}>U</span>
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
                <span style={styles.botAvatarText}>E</span>
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
      <motion.div
        style={styles.inputArea}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
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
      </motion.div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
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
    background: "linear-gradient(135deg, #FFF8E7 0%, #FFFEF7 50%, #FFF5E1 100%)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  bgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  floatingShape: {
    position: "absolute",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(212,165,116,0.4) 0%, rgba(245,230,163,0.25) 40%, transparent 70%)",
    filter: "blur(40px)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    background: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 20px rgba(139, 119, 80, 0.08)",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #E8D48B 50%, #D4A574 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(212, 165, 116, 0.35)",
  },
  avatarText: {
    fontSize: "22px",
    fontWeight: "900",
    color: "white",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  headerName: {
    margin: 0,
    fontWeight: "700",
    color: "#5D4E37",
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
    background: "#68D391",
    boxShadow: "0 0 8px rgba(104, 211, 145, 0.5)",
  },
  headerStatus: {
    margin: 0,
    fontSize: "12px",
    color: "#9C8B7A",
    fontWeight: "500",
  },
  headerButtons: {
    display: "flex",
    gap: "8px",
  },
  dashBtn: {
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(212, 165, 116, 0.3)",
    background: "rgba(255, 255, 255, 0.4)",
    color: "#5D4E37",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    backdropFilter: "blur(10px)",
    transition: "all 0.2s",
  },
  logoutBtn: {
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(197, 48, 48, 0.2)",
    background: "rgba(254, 215, 215, 0.4)",
    color: "#C53030",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    backdropFilter: "blur(10px)",
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
    maxWidth: "75%",
  },
  botAvatar: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #E8D48B 50%, #D4A574 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 3px 10px rgba(212, 165, 116, 0.3)",
  },
  botAvatarText: {
    fontSize: "14px",
    fontWeight: "800",
    color: "white",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #68D391 0%, #48BB78 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 3px 10px rgba(104, 211, 145, 0.3)",
  },
  userAvatarText: {
    fontSize: "14px",
    fontWeight: "800",
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
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    color: "white",
    borderBottomRightRadius: "4px",
    marginLeft: "auto",
    boxShadow: "0 4px 15px rgba(212, 165, 116, 0.3)",
  },
  botBubble: {
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    color: "#5D4E37",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 4px 15px rgba(139, 119, 80, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
  typingWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
  },
  typingBubble: {
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    padding: "14px 18px",
    borderRadius: "18px",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 4px 15px rgba(139, 119, 80, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
  },
  typingDots: {
    display: "flex",
    gap: "5px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#D4A574",
    boxShadow: "0 2px 6px rgba(212, 165, 116, 0.4)",
  },
  inputArea: {
    padding: "16px 24px 20px",
    background: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.5)",
  },
  inputContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "14px",
    border: "2px solid rgba(212, 165, 116, 0.2)",
    background: "rgba(255, 255, 255, 0.5)",
    fontSize: "15px",
    color: "#5D4E37",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "50px",
    maxHeight: "120px",
    transition: "all 0.2s",
    boxShadow: "inset 0 2px 4px rgba(139, 119, 80, 0.05)",
  },
  sendBtn: {
    padding: "14px 28px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(212, 165, 116, 0.35)",
    transition: "all 0.2s",
  },
  inputHint: {
    margin: "8px 0 0",
    fontSize: "12px",
    color: "#9C8B7A",
    textAlign: "center",
    fontWeight: "500",
  },
};
