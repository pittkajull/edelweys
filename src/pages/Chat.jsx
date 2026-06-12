import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";

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
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        setUserId(session.user.id);
        // Fetch profile
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(prof);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?",
      },
    ]);
    setActiveChat(null);
  };

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  // Dummy chat history for demo
  const dummyHistory = [
    { id: 1, title: "Tentang pola makan sehat", time: "2 jam lalu" },
    { id: 2, title: "Tips olahraga rutin", time: "Kemarin" },
    { id: 3, title: "Konsultasi tidur", time: "3 hari lalu" },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <span style={styles.logoText}>E</span>
          </div>
          <span style={styles.logoTitle}>Edelweys</span>
        </div>

        {/* New Chat Button */}
        <button onClick={startNewChat} style={styles.newChatBtn}>
          <span style={styles.newChatIcon}>+</span>
          Obrolan Baru
        </button>

        {/* Chat History */}
        <div style={styles.historySection}>
          <p style={styles.historyLabel}>Riwayat Obrolan</p>
          {dummyHistory.map((chat) => (
            <div
              key={chat.id}
              style={{
                ...styles.historyItem,
                background: activeChat === chat.id ? "rgba(212, 165, 116, 0.15)" : "transparent",
              }}
              onClick={() => setActiveChat(chat.id)}
            >
              <p style={styles.historyTitle}>{chat.title}</p>
              <p style={styles.historyTime}>{chat.time}</p>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={styles.sidebarBottom}>
          <div style={styles.profileSection}>
            <div style={styles.profileAvatar}>
              <span style={styles.profileAvatarText}>
                {profile?.full_name?.charAt(0) || "U"}
              </span>
            </div>
            <div style={styles.profileInfo}>
              <p style={styles.profileName}>{profile?.full_name || "User"}</p>
              <p style={styles.profileEmail}>{profile?.username || "user"}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={styles.mainChat}>
        {/* Header */}
        <div style={styles.chatHeader}>
          <div style={styles.chatHeaderLeft}>
            <div style={styles.chatAvatar}>
              <span style={styles.chatAvatarText}>E</span>
            </div>
            <div>
              <p style={styles.chatName}>Edelweys</p>
              <div style={styles.statusContainer}>
                <div style={styles.statusDot} />
                <p style={styles.statusText}>Online</p>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} style={styles.dashBtn}>
            Dashboard
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
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
            </div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                style={styles.messageRow}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #FFF8E7 0%, #FFFEF7 50%, #FFF5E1 100%)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  // Sidebar Styles
  sidebar: {
    width: "280px",
    background: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.5)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "4px 0 20px rgba(139, 119, 80, 0.08)",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
  },
  logo: {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #E8D48B 50%, #D4A574 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(212, 165, 116, 0.35)",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "white",
  },
  logoTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#5D4E37",
  },
  newChatBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "16px 20px",
    padding: "12px 16px",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(212, 165, 116, 0.3)",
    fontFamily: "inherit",
  },
  newChatIcon: {
    fontSize: "18px",
    fontWeight: "700",
  },
  historySection: {
    flex: 1,
    overflowY: "auto",
    padding: "0 12px",
  },
  historyLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9C8B7A",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "8px 8px 12px",
    margin: 0,
  },
  historyItem: {
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "4px",
    transition: "background 0.2s",
  },
  historyTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#5D4E37",
    margin: "0 0 4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  historyTime: {
    fontSize: "11px",
    color: "#9C8B7A",
    margin: 0,
  },
  sidebarBottom: {
    padding: "16px 20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.5)",
    background: "rgba(255, 255, 255, 0.3)",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  profileAvatar: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
  },
  profileInfo: {
    flex: 1,
    overflow: "hidden",
  },
  profileName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#5D4E37",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  profileEmail: {
    fontSize: "12px",
    color: "#9C8B7A",
    margin: 0,
  },
  logoutBtn: {
    width: "100%",
    padding: "10px",
    background: "rgba(197, 48, 48, 0.1)",
    border: "1px solid rgba(197, 48, 48, 0.2)",
    borderRadius: "10px",
    color: "#C53030",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Main Chat Styles
  mainChat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    background: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 20px rgba(139, 119, 80, 0.08)",
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  chatAvatar: {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #E8D48B 50%, #D4A574 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(212, 165, 116, 0.35)",
  },
  chatAvatarText: {
    fontSize: "18px",
    fontWeight: "800",
    color: "white",
  },
  chatName: {
    margin: 0,
    fontWeight: "700",
    color: "#5D4E37",
    fontSize: "16px",
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
  statusText: {
    margin: 0,
    fontSize: "12px",
    color: "#9C8B7A",
  },
  dashBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid rgba(212, 165, 116, 0.3)",
    background: "rgba(255, 255, 255, 0.4)",
    color: "#5D4E37",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    backdropFilter: "blur(10px)",
    fontFamily: "inherit",
  },

  // Messages Styles
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    maxWidth: "70%",
  },
  botAvatar: {
    width: "32px",
    height: "32px",
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
    width: "32px",
    height: "32px",
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
    fontSize: "14px",
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
    textAlign: "left",
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

  // Input Area Styles
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
    border: "2px solid rgba(255, 255, 255, 0.4)",
    background: "rgba(255, 255, 255, 0.4)",
    fontSize: "14px",
    color: "#5D4E37",
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "48px",
    maxHeight: "120px",
    transition: "all 0.2s",
  },
  sendBtn: {
    padding: "14px 24px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(212, 165, 116, 0.35)",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  inputHint: {
    margin: "8px 0 0",
    fontSize: "11px",
    color: "#9C8B7A",
    textAlign: "center",
  },
};
