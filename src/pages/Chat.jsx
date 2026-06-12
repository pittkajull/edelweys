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

  // Floating shapes for background
  const shapes = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    size: Math.random() * 80 + 40,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
  }));

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgContainer}>
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            style={{
              ...styles.floatingShape,
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
            }}
            animate={{
              y: [0, -20, 0, 20, 0],
              x: [0, 15, 0, -15, 0],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.headerLeft}>
          <motion.div
            style={styles.avatar}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <div style={styles.avatarIcon}>E</div>
          </motion.div>
          <div>
            <p style={styles.headerName}>Edelweys</p>
            <div style={styles.statusContainer}>
              <motion.div
                style={styles.statusDot}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p style={styles.headerStatus}>Online</p>
            </div>
          </div>
        </div>
        <div style={styles.headerButtons}>
          <motion.button
            onClick={() => navigate("/dashboard")}
            style={styles.dashBtn}
            whileHover={{ scale: 1.05, backgroundColor: "#4CAF7D" }}
            whileTap={{ scale: 0.95 }}
          >
            Dashboard
          </motion.button>
          <motion.button
            onClick={handleLogout}
            style={styles.logoutBtn}
            whileHover={{ scale: 1.05, backgroundColor: "#EF4444" }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
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
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "assistant" && (
                <div style={styles.botAvatar}><div style={styles.botAvatarIcon}>E</div></div>
              )}
              <motion.div
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
                }}
                whileHover={{ scale: 1.02 }}
              >
                {msg.content}
              </motion.div>
              {msg.role === "user" && (
                <div style={styles.userAvatar}><div style={styles.userAvatarIcon}>U</div></div>
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
              <div style={styles.botAvatar}><div style={styles.botAvatarIcon}>E</div></div>
              <div style={styles.typingBubble}>
                <div style={styles.typingDots}>
                  <motion.div
                    style={styles.dot}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    style={styles.dot}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    style={styles.dot}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
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
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
          <motion.button
            onClick={sendMessage}
            style={{
              ...styles.sendBtn,
              opacity: input.trim() ? 1 : 0.5,
            }}
            whileHover={input.trim() ? { scale: 1.1, boxShadow: "0 6px 25px rgba(233, 30, 140, 0.4)" } : {}}
            whileTap={input.trim() ? { scale: 0.9 } : {}}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div style={styles.spinner} />
              </motion.div>
            ) : (
              "Kirim"
            )}
          </motion.button>
        </div>
        <p style={styles.inputHint}>Tekan Enter untuk kirim, Shift + Enter untuk baris baru</p>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #fce4ec 100%)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    margin: 0,
    padding: 0,
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
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 32px",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    position: "relative",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "60px",
    height: "60px",
    background: "rgba(255, 255, 255, 0.3)",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "900",
    color: "white",
  },
  headerName: {
    margin: 0,
    fontWeight: "800",
    color: "#e91e8c",
    fontSize: "24px",
    letterSpacing: "-0.02em",
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#4CAF7D",
  },
  headerStatus: {
    margin: 0,
    fontSize: "12px",
    color: "#4CAF7D",
    fontWeight: "600",
  },
  headerButtons: {
    display: "flex",
    gap: "8px",
  },
  dashBtn: {
    padding: "12px 20px",
    borderRadius: "14px",
    border: "2px solid #4CAF7D",
    background: "rgba(76, 175, 125, 0.1)",
    color: "#4CAF7D",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },
  logoutBtn: {
    padding: "12px 20px",
    borderRadius: "14px",
    border: "2px solid #EF4444",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#EF4444",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    transition: "all 0.2s ease",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
    zIndex: 10,
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  botAvatar: {
    width: "36px",
    height: "36px",
    background: "rgba(255, 255, 255, 0.4)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  botAvatarIcon: {
    width: "28px",
    height: "28px",
    background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
    color: "white",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    background: "rgba(233, 30, 140, 0.2)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userAvatarIcon: {
    width: "28px",
    height: "28px",
    background: "linear-gradient(135deg, #4CAF7D 0%, #38A169 100%)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "900",
    color: "white",
  },
  bubble: {
    maxWidth: "70%",
    padding: "18px 24px",
    borderRadius: "24px",
    fontSize: "16px",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  },
  userBubble: {
    background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
    color: "white",
    borderBottomRightRadius: "4px",
  },
  botBubble: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    color: "#333",
    borderBottomLeftRadius: "4px",
  },
  typingWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  typingBubble: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    padding: "14px 20px",
    borderRadius: "20px",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#e91e8c",
  },
  inputArea: {
    padding: "24px 32px 32px",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative",
    zIndex: 10,
    maxWidth: "1000px",
    margin: "0 auto",
    width: "100%",
  },
  inputContainer: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "18px 24px",
    borderRadius: "20px",
    border: "2px solid rgba(255, 255, 255, 0.4)",
    background: "rgba(255, 255, 255, 0.3)",
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "60px",
    maxHeight: "150px",
    transition: "all 0.2s ease",
  },
  sendBtn: {
    width: "60px",
    height: "60px",
    borderRadius: "20px",
    border: "none",
    background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 25px rgba(233, 30, 140, 0.35)",
    transition: "all 0.2s ease",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
  },
  inputHint: {
    margin: "10px 0 0",
    fontSize: "13px",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    fontWeight: "500",
  },
};
